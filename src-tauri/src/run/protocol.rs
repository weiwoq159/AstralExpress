use serde::Deserialize;
use serde_json::{Map, Value};

/// 插件脚本通过 stdout 按行输出的一条指令。脚本不再只是"跑完了打印一行结果"，
/// 而是可以在执行过程中随时吐出类型化的消息，让 Rust 侧决定要做什么：
///
/// - `success`：任务成功结束，带一句人话摘要，可选再带一份结构化 data（存进 result_json）。
/// - `failed`：任务失败结束，带一句人话原因。
/// - `process`：汇报进度（currentIndex / total，都可选，缺的就不更新对应字段）。
/// - `download`：交给 Rust 实际发 HTTP 请求把文件下载到本地（脚本自己不下载）。
/// - `db_insert`：往白名单里的表写一行数据，脚本自己不摸数据库连接。
///
/// 每行是 `{"type": "...", "payload": {...}}` 这种判别字段 + 单一载荷的结构——JSON 里
/// 就叫 adjacently tagged，Rust 端直接靠 serde 的 `tag`/`content` 解出来，不用手写字段
/// 抽取。`success`/`failed` 是终态：读到哪个就把 stdout 循环里记的终态结果覆盖成哪个，
/// **以最后一条终态消息为准**，跟进程退出码无关——退出码只在脚本从头到尾没输出过任何
/// 终态消息（比如中途崩溃）时才当兜底信号用，见 `run::executor::execute_process`。
///
/// 每条消息可以带一个 `manifest` 字段，但 Rust 不校验它——调度引擎本来就是一个任务一个进程，
/// 这条消息属于哪个任务已经确定了，这个字段纯粹给人读日志用。
///
/// 没有 `type` 字段的一行，按旧协议处理：整行原样当最终结果，兼容现在还没迁移到这套消息
/// 协议的插件脚本（`print(json.dumps(result))`）。有 `type` 字段但解不出已知类型（typo、
/// 缺必填字段）的一行**不会**退化成旧协议——那样会把一条本该报错的坏消息悄悄当成"成功
/// 结果"存下来，比直接丢弃更危险，所以只记警告日志跳过。
#[derive(Debug)]
pub enum ExecutorMessage {
    Success {
        message: Option<String>,
        data: Option<Value>,
    },
    Failed {
        message: String,
    },
    Process {
        current_index: Option<i64>,
        total: Option<i64>,
    },
    Download {
        download_url: String,
        download_path: String,
        download_name: String,
    },
    DbInsert {
        table_name: String,
        value: Map<String, Value>,
    },
    LegacyResult(Value),
}

impl ExecutorMessage {
    pub fn parse(line: &str) -> Option<Self> {
        let value: Value = serde_json::from_str(line).ok()?;
        if value.get("type").is_none() {
            return Some(Self::LegacyResult(value));
        }
        serde_json::from_value::<Tagged>(value).ok().map(Self::from)
    }
}

impl From<Tagged> for ExecutorMessage {
    fn from(tagged: Tagged) -> Self {
        match tagged {
            Tagged::Success { message, data } => Self::Success { message, data },
            Tagged::Failed { message } => Self::Failed { message },
            Tagged::Process {
                current_index,
                total,
            } => Self::Process {
                current_index,
                total,
            },
            Tagged::Download {
                download_url,
                download_path,
                download_name,
            } => Self::Download {
                download_url,
                download_path,
                download_name,
            },
            Tagged::DbInsert { table_name, value } => Self::DbInsert { table_name, value },
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", content = "payload", rename_all = "snake_case")]
enum Tagged {
    Success {
        #[serde(default)]
        message: Option<String>,
        #[serde(default)]
        data: Option<Value>,
    },
    Failed {
        message: String,
    },
    #[serde(rename_all = "camelCase")]
    Process {
        #[serde(default, deserialize_with = "as_i64_lenient_opt")]
        current_index: Option<i64>,
        #[serde(default, deserialize_with = "as_i64_lenient_opt")]
        total: Option<i64>,
    },
    #[serde(rename_all = "camelCase")]
    Download {
        download_url: String,
        download_path: String,
        download_name: String,
    },
    #[serde(rename_all = "camelCase")]
    DbInsert {
        table_name: String,
        value: Map<String, Value>,
    },
}

/// currentIndex/total 在协议示例里是当字符串写的（`"2"`），实际实现里数字/数字字符串都收。
fn as_i64_lenient_opt<'de, D>(deserializer: D) -> Result<Option<i64>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let value = Option::<Value>::deserialize(deserializer)?;
    Ok(match value {
        Some(Value::Number(number)) => number.as_i64(),
        Some(Value::String(text)) => text.parse().ok(),
        _ => None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn parses_success_with_message_and_data() {
        let line = json!({ "type": "success", "payload": { "message": "完成", "data": { "renamed": 3 } } }).to_string();
        match ExecutorMessage::parse(&line).expect("should parse") {
            ExecutorMessage::Success { message, data } => {
                assert_eq!(message.as_deref(), Some("完成"));
                assert_eq!(data, Some(json!({ "renamed": 3 })));
            }
            _ => panic!("expected success"),
        }
    }

    #[test]
    fn parses_success_with_empty_payload() {
        let line = json!({ "type": "success", "payload": {} }).to_string();
        match ExecutorMessage::parse(&line).expect("should parse") {
            ExecutorMessage::Success { message, data } => {
                assert_eq!(message, None);
                assert_eq!(data, None);
            }
            _ => panic!("expected success"),
        }
    }

    #[test]
    fn parses_failed_with_message() {
        let line =
            json!({ "type": "failed", "payload": { "message": "目标文件夹不存在" } }).to_string();
        match ExecutorMessage::parse(&line).expect("should parse") {
            ExecutorMessage::Failed { message } => assert_eq!(message, "目标文件夹不存在"),
            _ => panic!("expected failed"),
        }
    }

    #[test]
    fn failed_without_message_fails_to_parse() {
        let line = json!({ "type": "failed", "payload": {} }).to_string();
        assert!(ExecutorMessage::parse(&line).is_none());
    }

    #[test]
    fn parses_process_with_string_current_index() {
        let line = json!({ "type": "process", "manifest": "batch-rename", "payload": { "currentIndex": "2" } }).to_string();
        match ExecutorMessage::parse(&line).expect("should parse") {
            ExecutorMessage::Process {
                current_index,
                total,
            } => {
                assert_eq!(current_index, Some(2));
                assert_eq!(total, None);
            }
            _ => panic!("expected process"),
        }
    }

    #[test]
    fn parses_download_payload() {
        let line = json!({
            "type": "download",
            "manifest": "image-archive",
            "payload": {
                "downloadUrl": "https://example.com/a.png",
                "downloadPath": "/path/to/download",
                "downloadName": "a.png",
            }
        })
        .to_string();
        match ExecutorMessage::parse(&line).expect("should parse") {
            ExecutorMessage::Download {
                download_url,
                download_path,
                download_name,
            } => {
                assert_eq!(download_url, "https://example.com/a.png");
                assert_eq!(download_path, "/path/to/download");
                assert_eq!(download_name, "a.png");
            }
            _ => panic!("expected download"),
        }
    }

    #[test]
    fn download_missing_payload_field_fails_to_parse() {
        let line =
            json!({ "type": "download", "manifest": "image-archive", "payload": {} }).to_string();
        assert!(ExecutorMessage::parse(&line).is_none());
    }

    #[test]
    fn parses_db_insert_payload() {
        let line = json!({
            "type": "db_insert",
            "manifest": "mhxy-cbg-services",
            "payload": {
                "tableName": "mhxy_cbg_servers",
                "value": { "server_id": 229, "area_id": 40, "name": "雄鹰岭" },
            }
        })
        .to_string();
        match ExecutorMessage::parse(&line).expect("should parse") {
            ExecutorMessage::DbInsert { table_name, value } => {
                assert_eq!(table_name, "mhxy_cbg_servers");
                assert_eq!(value.get("server_id"), Some(&json!(229)));
            }
            _ => panic!("expected db insert"),
        }
    }

    #[test]
    fn untagged_line_falls_back_to_legacy_result() {
        let line = json!({ "renamed": 3, "unchanged": 1 }).to_string();
        match ExecutorMessage::parse(&line).expect("should parse") {
            ExecutorMessage::LegacyResult(data) => {
                assert_eq!(data, json!({ "renamed": 3, "unchanged": 1 }))
            }
            _ => panic!("expected legacy result"),
        }
    }

    #[test]
    fn unknown_type_does_not_fall_back_to_legacy_result() {
        let line = json!({ "type": "progress", "payload": { "done": 3 } }).to_string();
        assert!(ExecutorMessage::parse(&line).is_none());
    }

    #[test]
    fn non_json_line_returns_none() {
        assert!(ExecutorMessage::parse("梦幻西游藏宝阁爬虫尚未实现。").is_none());
    }
}
