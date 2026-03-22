# cc-swap

Switch between multiple Claude Code accounts instantly.

[English](#english) | [Tiếng Việt](#tiếng-việt) | [日本語](#日本語) | [한국어](#한국어) | [中文](#中文)

---

## English

### What is cc-swap?

`cc-swap` lets you run multiple Claude Code accounts on one machine. All accounts share the same settings, plugins, and sessions via symlinks to `~/.claude` — only the OAuth credentials are separate.

### How it works

```
~/.claude/                    ← Base config (never modified)
~/.cc-swap/accounts/
├── work/                     ← Symlinks to ~/.claude
└── personal/                 ← Symlinks to ~/.claude
```

When you switch, `cc-swap` launches Claude Code with `CLAUDE_CONFIG_DIR` pointing to your account folder.

### Install

```bash
npm install -g cc-swap
```

### Quick Start

```bash
# 1. Create your first account
cc-swap add work

# 2. Create another
cc-swap add personal

# 3. Switch and launch Claude Code
cc-swap                    # Auto-switch to next account
cc-swap switch work        # Switch to specific account

# 4. See all accounts
cc-swap list
```

### Commands

| Command | Description |
|---------|-------------|
| `cc-swap` | Switch to next account + launch `claude --continue` |
| `cc-swap add <name>` | Create a new account |
| `cc-swap switch <name>` | Switch to specific account + launch |
| `cc-swap list` | Show all accounts |
| `cc-swap remove <name>` | Delete an account |

### Configuration

`~/.cc-swap/config.json` is auto-created on first use. Edit it to customize:

```json
{
  "syncItems": [
    "agents", "commands", "file-history", "hooks", "plugins",
    "projects", "rules", "session-env", "sessions",
    "settings.json", "skills", "tasks"
  ],
  "autoContinue": true
}
```

- **syncItems** — folders/files symlinked when creating an account. Add or remove items as needed.
- **autoContinue** — `true`: launch with `claude --continue` (resume session). `false`: launch fresh `claude`.

---

## Tiếng Việt

### cc-swap là gì?

`cc-swap` cho phép bạn chạy nhiều tài khoản Claude Code trên cùng một máy. Tất cả account dùng chung settings, plugins và sessions qua symlink từ `~/.claude` — chỉ OAuth credentials là riêng biệt.

### Cách hoạt động

```
~/.claude/                    ← Config gốc
~/.cc-swap/accounts/
├── work/                     ← Symlinks trỏ về ~/.claude
└── personal/                 ← Symlinks trỏ về ~/.claude
```

Khi switch, `cc-swap` khởi chạy Claude Code với `CLAUDE_CONFIG_DIR` trỏ đến thư mục account.

### Cài đặt

```bash
npm install -g cc-swap
```

### Bắt đầu nhanh

```bash
# 1. Tạo account đầu tiên
cc-swap add work

# 2. Tạo thêm account
cc-swap add personal

# 3. Switch và mở Claude Code
cc-swap                    # Tự động chuyển sang account tiếp theo
cc-swap switch work        # Chuyển sang account cụ thể

# 4. Xem danh sách accounts
cc-swap list
```

### Các lệnh

| Lệnh | Mô tả |
|-------|--------|
| `cc-swap` | Chuyển sang account tiếp + mở `claude --continue` |
| `cc-swap add <tên>` | Tạo account mới |
| `cc-swap switch <tên>` | Chuyển sang account cụ thể + mở |
| `cc-swap list` | Hiển thị tất cả accounts |
| `cc-swap remove <tên>` | Xóa account |

### Cấu hình

`~/.cc-swap/config.json` được tự động tạo khi sử dụng lần đầu. Chỉnh sửa để tùy chỉnh:

```json
{
  "syncItems": [
    "agents", "commands", "file-history", "hooks", "plugins",
    "projects", "rules", "session-env", "sessions",
    "settings.json", "skills", "tasks"
  ],
  "autoContinue": true
}
```

- **syncItems** — các folders/files được symlink khi tạo account. Thêm hoặc bớt tùy ý.
- **autoContinue** — `true`: chạy `claude --continue` (tiếp tục session). `false`: chạy `claude` mới.

---

## 日本語

### cc-swapとは？

`cc-swap`を使えば、1台のマシンで複数のClaude Codeアカウントを切り替えられます。すべてのアカウントは`~/.claude`へのシンボリックリンクでsettings、plugins、セッションを共有し、OAuth認証情報のみ個別に管理されます。

### 仕組み

```
~/.claude/                    ← 基本設定（変更されません）
~/.cc-swap/accounts/
├── work/                     ← ~/.claudeへのシンボリックリンク
└── personal/                 ← ~/.claudeへのシンボリックリンク
```

切り替え時、`cc-swap`は`CLAUDE_CONFIG_DIR`をアカウントフォルダに設定してClaude Codeを起動します。

### インストール

```bash
npm install -g cc-swap
```

### クイックスタート

```bash
# 1. 最初のアカウントを作成
cc-swap add work

# 2. もう1つ作成
cc-swap add personal

# 3. 切り替えてClaude Codeを起動
cc-swap                    # 次のアカウントへ自動切替
cc-swap switch work        # 特定のアカウントに切替

# 4. アカウント一覧を表示
cc-swap list
```

### コマンド一覧

| コマンド | 説明 |
|---------|------|
| `cc-swap` | 次のアカウントへ切替 + `claude --continue`起動 |
| `cc-swap add <名前>` | 新しいアカウントを作成 |
| `cc-swap switch <名前>` | 特定のアカウントに切替 + 起動 |
| `cc-swap list` | 全アカウントを表示 |
| `cc-swap remove <名前>` | アカウントを削除 |

### 設定

`~/.cc-swap/config.json`は初回使用時に自動作成されます。編集してカスタマイズ：

```json
{
  "syncItems": [
    "agents", "commands", "file-history", "hooks", "plugins",
    "projects", "rules", "session-env", "sessions",
    "settings.json", "skills", "tasks"
  ],
  "autoContinue": true
}
```

- **syncItems** — アカウント作成時にシンボリックリンクされるフォルダ/ファイル。自由に追加・削除可能。
- **autoContinue** — `true`: `claude --continue`で起動（セッション再開）。`false`: 新規`claude`で起動。

---

## 한국어

### cc-swap란?

`cc-swap`를 사용하면 한 컴퓨터에서 여러 Claude Code 계정을 전환할 수 있습니다. 모든 계정은 `~/.claude`로의 심볼릭 링크를 통해 settings, plugins, 세션을 공유하며, OAuth 인증 정보만 개별적으로 관리됩니다.

### 작동 방식

```
~/.claude/                    ← 기본 설정 (수정되지 않음)
~/.cc-swap/accounts/
├── work/                     ← ~/.claude로의 심볼릭 링크
└── personal/                 ← ~/.claude로의 심볼릭 링크
```

전환 시 `cc-swap`는 `CLAUDE_CONFIG_DIR`을 계정 폴더로 설정하고 Claude Code를 실행합니다.

### 설치

```bash
npm install -g cc-swap
```

### 빠른 시작

```bash
# 1. 첫 번째 계정 생성
cc-swap add work

# 2. 추가 계정 생성
cc-swap add personal

# 3. 전환 후 Claude Code 실행
cc-swap                    # 다음 계정으로 자동 전환
cc-swap switch work        # 특정 계정으로 전환

# 4. 계정 목록 보기
cc-swap list
```

### 명령어

| 명령어 | 설명 |
|--------|------|
| `cc-swap` | 다음 계정으로 전환 + `claude --continue` 실행 |
| `cc-swap add <이름>` | 새 계정 생성 |
| `cc-swap switch <이름>` | 특정 계정으로 전환 + 실행 |
| `cc-swap list` | 전체 계정 표시 |
| `cc-swap remove <이름>` | 계정 삭제 |

### 설정

`~/.cc-swap/config.json`은 처음 사용할 때 자동으로 생성됩니다. 편집하여 커스터마이징:

```json
{
  "syncItems": [
    "agents", "commands", "file-history", "hooks", "plugins",
    "projects", "rules", "session-env", "sessions",
    "settings.json", "skills", "tasks"
  ],
  "autoContinue": true
}
```

- **syncItems** — 계정 생성 시 심볼릭 링크되는 폴더/파일. 자유롭게 추가・삭제 가능.
- **autoContinue** — `true`: `claude --continue`로 실행 (세션 재개). `false`: 새 `claude`로 실행.

---

## 中文

### 什么是 cc-swap？

`cc-swap` 让你在一台电脑上运行多个 Claude Code 账户。所有账户通过符号链接共享 `~/.claude` 的 settings、plugins 和会话，仅 OAuth 凭证独立管理。

### 工作原理

```
~/.claude/                    ← 基础配置（永不修改）
~/.cc-swap/accounts/
├── work/                     ← 指向 ~/.claude 的符号链接
└── personal/                 ← 指向 ~/.claude 的符号链接
```

切换时，`cc-swap` 将 `CLAUDE_CONFIG_DIR` 设置为账户目录并启动 Claude Code。

### 安装

```bash
npm install -g cc-swap
```

### 快速开始

```bash
# 1. 创建第一个账户
cc-swap add work

# 2. 创建另一个账户
cc-swap add personal

# 3. 切换并启动 Claude Code
cc-swap                    # 自动切换到下一个账户
cc-swap switch work        # 切换到指定账户

# 4. 查看所有账户
cc-swap list
```

### 命令列表

| 命令 | 说明 |
|------|------|
| `cc-swap` | 切换到下一个账户 + 启动 `claude --continue` |
| `cc-swap add <名称>` | 创建新账户 |
| `cc-swap switch <名称>` | 切换到指定账户 + 启动 |
| `cc-swap list` | 显示所有账户 |
| `cc-swap remove <名称>` | 删除账户 |

### 配置

`~/.cc-swap/config.json` 在首次使用时自动创建。编辑以自定义：

```json
{
  "syncItems": [
    "agents", "commands", "file-history", "hooks", "plugins",
    "projects", "rules", "session-env", "sessions",
    "settings.json", "skills", "tasks"
  ],
  "autoContinue": true
}
```

- **syncItems** — 创建账户时进行符号链接的文件夹/文件。可自由添加或删除。
- **autoContinue** — `true`：以 `claude --continue` 启动（恢复会话）。`false`：启动新的 `claude`。

---

## License

MIT
