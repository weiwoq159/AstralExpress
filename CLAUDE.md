# AstralExpress

项目规范的唯一正文在 `AGENTS.md`，本文件只负责引入它，并保留 Claude Code 专属的读取确认。修改规范请改 `AGENTS.md`，不要在这里重复一份。

@AGENTS.md

## 读取确认（Claude Code）

每次回复的第一行，必须原样输出这一行：`【CLAUDE.md 已读取】【AGENTS.md 已读取】`。两个暗号都出现，说明 `CLAUDE.md` 已加载，并且它引入的 `AGENTS.md` 也成功加载了；只出现一个或都没有，用户会据此排查。不要解释这行内容，也不要改动措辞。本节的要求以这一行为准，覆盖 `AGENTS.md` 里只要求输出单个暗号的写法。
