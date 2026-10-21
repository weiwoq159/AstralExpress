#!/bin/bash

set -e

echo "正在安装 Claude Code..."

curl -fsSL https://claude.ai/install.sh | bash

# Claude Code 默认安装到 ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"

# 确保以后打开终端也能找到 claude
if ! grep -q '.local/bin' "$HOME/.zshrc" 2>/dev/null; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
fi

echo ""
echo "安装完成。"
echo "Claude Code 版本："
claude --version

echo ""
echo "运行 Claude Code："
echo "  claude"