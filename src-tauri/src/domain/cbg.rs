use serde::{Deserialize, Serialize};

/// 一个大区下的服务器。字段名直接对应爬虫脚本（cbg-spider.py）输出 JSON 里
/// children 数组的形状，方便把爬虫结果原样反序列化后传给 cbg::repo::replace_all。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CbgServer {
    pub name: String,
    pub server_id: i64,
}

/// 藏宝阁梦幻西游的大区，children 为该大区下的服务器列表。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CbgArea {
    pub name: String,
    pub area_id: i64,
    pub children: Vec<CbgServer>,
}
