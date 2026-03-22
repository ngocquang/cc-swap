# cc-switch

Switch between multiple Claude Code accounts instantly.

[English](#english) | [Tiếng Việt](#tiếng-việt) | [日本語](#日本語) | [한국어](#한국어) | [中文](#中文)

---

## English

### What is cc-switch?

`cc-switch` lets you run multiple Claude Code accounts on one machine. Each account has its own settings, plugins, and session history — while sharing your base `~/.claude` config.

### How it works

```
~/.claude/                    ← Your base config (never modified)
~/.cc-switch/accounts/
├── work/                     ← Symlinks to ~/.claude + custom overrides
└── personal/                 ← Symlinks to ~/.claude + custom overrides
```

When you switch, `cc-switch` launches Claude Code with `CLAUDE_CONFIG_DIR` pointing to your account folder.

### Install

```bash
npm install -g cc-switch
```

### Quick Start

```bash
# 1. Create your first account
cc-switch add work

# 2. Create another
cc-switch add personal

# 3. Switch and launch Claude Code
cc-switch                    # Auto-switch to next account
cc-switch switch work        # Switch to specific account

# 4. See all accounts
cc-switch list
```

### Commands

| Command | Description |
|---------|-------------|
| `cc-switch` | Switch to next account + launch `claude --continue` |
| `cc-switch add <name>` | Create a new account |
| `cc-switch switch <name>` | Switch to specific account + launch |
| `cc-switch list` | Show all accounts |
| `cc-switch remove <name>` | Delete an account |

### Custom overrides

By default, each account shares everything with `~/.claude`. To customize an account:

```bash
# Example: custom settings for "work" account
cd ~/.cc-switch/claude-accounts/work
rm settings.json                           # Remove the symlink
cp ~/.claude/settings.json settings.json   # Copy and customize
```

---

## Tiếng Việt

### cc-switch là gì?

`cc-switch` cho phép bạn chạy nhiều tài khoản Claude Code trên cùng một máy. Mỗi tài khoản có settings, plugins và lịch sử session riêng — trong khi vẫn dùng chung config gốc từ `~/.claude`.

### Cách hoạt động

```
~/.claude/                    ← Config gốc (không bao giờ bị sửa)
~/.cc-switch/accounts/
├── work/                     ← Symlinks trỏ về ~/.claude + file riêng
└── personal/                 ← Symlinks trỏ về ~/.claude + file riêng
```

Khi switch, `cc-switch` khởi chạy Claude Code với `CLAUDE_CONFIG_DIR` trỏ đến thư mục account.

### Cài đặt

```bash
npm install -g cc-switch
```

### Bắt đầu nhanh

```bash
# 1. Tạo account đầu tiên
cc-switch add work

# 2. Tạo thêm account
cc-switch add personal

# 3. Switch và mở Claude Code
cc-switch                    # Tự động chuyển sang account tiếp theo
cc-switch switch work        # Chuyển sang account cụ thể

# 4. Xem danh sách accounts
cc-switch list
```

### Các lệnh

| Lệnh | Mô tả |
|-------|--------|
| `cc-switch` | Chuyển sang account tiếp + mở `claude --continue` |
| `cc-switch add <tên>` | Tạo account mới |
| `cc-switch switch <tên>` | Chuyển sang account cụ thể + mở |
| `cc-switch list` | Hiển thị tất cả accounts |
| `cc-switch remove <tên>` | Xóa account |

### Tùy chỉnh riêng cho từng account

Mặc định, mỗi account dùng chung mọi thứ với `~/.claude`. Để tùy chỉnh:

```bash
# Ví dụ: settings riêng cho account "work"
cd ~/.cc-switch/claude-accounts/work
rm settings.json                           # Xóa symlink
cp ~/.claude/settings.json settings.json   # Copy và chỉnh sửa
```

---

## 日本語

### cc-switchとは？

`cc-switch`を使えば、1台のマシンで複数のClaude Codeアカウントを切り替えられます。各アカウントは独自のsettings、plugins、セッション履歴を持ちながら、`~/.claude`の基本設定を共有します。

### 仕組み

```
~/.claude/                    ← 基本設定（変更されません）
~/.cc-switch/accounts/
├── work/                     ← ~/.claudeへのシンボリックリンク + カスタム設定
└── personal/                 ← ~/.claudeへのシンボリックリンク + カスタム設定
```

切り替え時、`cc-switch`は`CLAUDE_CONFIG_DIR`をアカウントフォルダに設定してClaude Codeを起動します。

### インストール

```bash
npm install -g cc-switch
```

### クイックスタート

```bash
# 1. 最初のアカウントを作成
cc-switch add work

# 2. もう1つ作成
cc-switch add personal

# 3. 切り替えてClaude Codeを起動
cc-switch                    # 次のアカウントへ自動切替
cc-switch switch work        # 特定のアカウントに切替

# 4. アカウント一覧を表示
cc-switch list
```

### コマンド一覧

| コマンド | 説明 |
|---------|------|
| `cc-switch` | 次のアカウントへ切替 + `claude --continue`起動 |
| `cc-switch add <名前>` | 新しいアカウントを作成 |
| `cc-switch switch <名前>` | 特定のアカウントに切替 + 起動 |
| `cc-switch list` | 全アカウントを表示 |
| `cc-switch remove <名前>` | アカウントを削除 |

### アカウントごとのカスタマイズ

デフォルトでは各アカウントは`~/.claude`の設定を共有します。カスタマイズするには：

```bash
# 例：「work」アカウント用のsettingsをカスタマイズ
cd ~/.cc-switch/claude-accounts/work
rm settings.json                           # シンボリックリンクを削除
cp ~/.claude/settings.json settings.json   # コピーして編集
```

---

## 한국어

### cc-switch란?

`cc-switch`를 사용하면 한 컴퓨터에서 여러 Claude Code 계정을 전환할 수 있습니다. 각 계정은 고유한 settings, plugins, 세션 기록을 가지면서 `~/.claude`의 기본 설정을 공유합니다.

### 작동 방식

```
~/.claude/                    ← 기본 설정 (수정되지 않음)
~/.cc-switch/accounts/
├── work/                     ← ~/.claude로의 심볼릭 링크 + 커스텀 설정
└── personal/                 ← ~/.claude로의 심볼릭 링크 + 커스텀 설정
```

전환 시 `cc-switch`는 `CLAUDE_CONFIG_DIR`을 계정 폴더로 설정하고 Claude Code를 실행합니다.

### 설치

```bash
npm install -g cc-switch
```

### 빠른 시작

```bash
# 1. 첫 번째 계정 생성
cc-switch add work

# 2. 추가 계정 생성
cc-switch add personal

# 3. 전환 후 Claude Code 실행
cc-switch                    # 다음 계정으로 자동 전환
cc-switch switch work        # 특정 계정으로 전환

# 4. 계정 목록 보기
cc-switch list
```

### 명령어

| 명령어 | 설명 |
|--------|------|
| `cc-switch` | 다음 계정으로 전환 + `claude --continue` 실행 |
| `cc-switch add <이름>` | 새 계정 생성 |
| `cc-switch switch <이름>` | 특정 계정으로 전환 + 실행 |
| `cc-switch list` | 전체 계정 표시 |
| `cc-switch remove <이름>` | 계정 삭제 |

### 계정별 커스터마이징

기본적으로 각 계정은 `~/.claude`의 설정을 공유합니다. 커스터마이징하려면:

```bash
# 예: "work" 계정의 settings 커스터마이징
cd ~/.cc-switch/claude-accounts/work
rm settings.json                           # 심볼릭 링크 삭제
cp ~/.claude/settings.json settings.json   # 복사 후 편집
```

---

## 中文

### 什么是 cc-switch？

`cc-switch` 让你在一台电脑上运行多个 Claude Code 账户。每个账户拥有独立的 settings、plugins 和会话记录，同时共享 `~/.claude` 的基础配置。

### 工作原理

```
~/.claude/                    ← 基础配置（永不修改）
~/.cc-switch/accounts/
├── work/                     ← 指向 ~/.claude 的符号链接 + 自定义配置
└── personal/                 ← 指向 ~/.claude 的符号链接 + 自定义配置
```

切换时，`cc-switch` 将 `CLAUDE_CONFIG_DIR` 设置为账户目录并启动 Claude Code。

### 安装

```bash
npm install -g cc-switch
```

### 快速开始

```bash
# 1. 创建第一个账户
cc-switch add work

# 2. 创建另一个账户
cc-switch add personal

# 3. 切换并启动 Claude Code
cc-switch                    # 自动切换到下一个账户
cc-switch switch work        # 切换到指定账户

# 4. 查看所有账户
cc-switch list
```

### 命令列表

| 命令 | 说明 |
|------|------|
| `cc-switch` | 切换到下一个账户 + 启动 `claude --continue` |
| `cc-switch add <名称>` | 创建新账户 |
| `cc-switch switch <名称>` | 切换到指定账户 + 启动 |
| `cc-switch list` | 显示所有账户 |
| `cc-switch remove <名称>` | 删除账户 |

### 账户自定义

默认情况下，每个账户与 `~/.claude` 共享所有配置。如需自定义：

```bash
# 例：为 "work" 账户自定义 settings
cd ~/.cc-switch/claude-accounts/work
rm settings.json                           # 删除符号链接
cp ~/.claude/settings.json settings.json   # 复制并编辑
```

---

## License

MIT
