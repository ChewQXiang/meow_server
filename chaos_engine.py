import subprocess

# ====== 指令執行工具 ======
def run(cmd: str):
    """
    簡單包一層 shell 指令執行，回傳 (stdout, stderr, returncode)
    """
    print("[RUN]", cmd)
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip(), result.stderr.strip(), result.returncode


# ====== 題庫：期中考模式題目 ======
TEMPLATES = [
    {
        "id": "mid_missing_index",
        "desc": "首頁檔案被貓搬走了",
        "explain": (
            "題目 1：首頁檔案被貓搬走了\n\n"
            "原本 /var/www/html/index.html 應該要存在，\n"
            "但現在被搬到 /tmp/.cat_hide/index.html。\n"
            "任務：用 find 找到檔案位置，搬回正確目錄，並確保權限正常。"
        ),
        "chaos_cmd": """
docker exec trainee bash -c '
  mkdir -p /tmp/.cat_hide &&
  if [ -f /var/www/html/index.html ]; then
    mv /var/www/html/index.html /tmp/.cat_hide/index.html;
  fi
'
""",
        "hint": "試試看用 find / -name index.html 找出檔案在哪裡，然後搬回 /var/www/html/。",
        "hints": [
            "先確認網站根目錄在哪裡：試試看 ls -R /var/www。",
            "如果在原本目錄找不到 index.html，可以用 find / -name index.html 2>/dev/null 在整個系統搜尋。",
            "找到檔案後，用 mv 把它搬回 /var/www/html/index.html，再確認權限是否正確（chmod 644）。",
        ],
        # 驗證：index.html 存在就算過（權限題留給下一題）
        "check_cmd": """
if [ -f /var/www/html/index.html ]; then
  echo OK;
fi
"""
    },
    {
        "id": "mid_index_permission_broken",
        "desc": "首頁檔案權限被改成 000",
        "explain": (
            "題目 2：首頁檔案權限被改成 000\n\n"
            "檔案 /var/www/html/index.html 還在，但權限被改成 000，\n"
            "任何人都無法讀取它，web server 也看不到。\n"
            "任務：把權限修回 644（-rw-r--r--）。"
        ),
        "chaos_cmd": """
docker exec trainee bash -c '
  if [ -f /var/www/html/index.html ]; then
    chmod 000 /var/www/html/index.html;
  fi
'
""",
        "hint": "用 ls -l 看權限，有沒有 000？試著改回 644。",
        "hints": [
            "先用 ls -l /var/www/html/index.html 看看目前權限。",
            "權限 000 代表誰都不能讀，你可以用 chmod 644 /var/www/html/index.html 把它改回正常。",
            "確認權限改回後，再重新整理網頁看看是否正常。",
        ],
        # 驗證：檔案存在且權限為 644
        "check_cmd": """
if [ -f /var/www/html/index.html ]; then
  mode=$(stat -c "%a" /var/www/html/index.html 2>/dev/null);
  if [ "$mode" = "644" ]; then
    echo OK;
  fi
fi
"""
    },
    {
        "id": "mid_apt_source_broken",
        "desc": "apt 套件來源被改成錯的網址了",
        "explain": (
            "題目 3：apt 套件來源被改壞（sources.list）\n\n"
            "系統的 /etc/apt/sources.list 被改成 tw.archive.ubuntu.com，\n"
            "但公司政策要求改用 ftp.ubuntu-tw.org/ubuntu。\n"
            "任務：修正 sources.list 內容，改成使用 ftp.ubuntu-tw.org/ubuntu，\n"
            "並移除 tw.archive.ubuntu.com。"
        ),
        "chaos_cmd": """
docker exec trainee bash -c '
  printf "deb http://tw.archive.ubuntu.com/ubuntu jammy main restricted universe multiverse\\n" > /etc/apt/sources.list
'
""",
        "hint": "用 cat /etc/apt/sources.list 看現在長怎樣，然後把網址改成 ftp.ubuntu-tw.org/ubuntu。",
        "hints": [
            "先用 cat /etc/apt/sources.list 看看現在的內容。",
            "把其中的 tw.archive.ubuntu.com 改成 ftp.ubuntu-tw.org/ubuntu。",
            "再確認檔案裡面不再出現 tw.archive.ubuntu.com。",
        ],
        # 驗證：含 ftp.ubuntu-tw.org/ubuntu，且不含 tw.archive.ubuntu.com
        "check_cmd": """
if grep -q 'ftp.ubuntu-tw.org/ubuntu' /etc/apt/sources.list 2>/dev/null; then
  if ! grep -q 'tw.archive.ubuntu.com' /etc/apt/sources.list 2>/dev/null; then
    echo OK;
  fi
fi
"""
    },
    {
        "id": "mid_dns_resolver_broken",
        "desc": "DNS 設定錯誤，nameserver 被改掉了",
        "explain": (
            "題目 4：DNS 設定錯誤（/etc/resolv.conf）\n\n"
            "系統的 /etc/resolv.conf 被改成奇怪的 nameserver (例如 1.2.3.4），\n"
            "導致 DNS 查詢可能失敗。\n"
            "任務：把 /etc/resolv.conf 修成只使用 nameserver 8.8.8.8。"
        ),
        "chaos_cmd": """
docker exec trainee bash -c '
  printf "nameserver 1.2.3.4\\n" > /etc/resolv.conf
'
""",
        "hint": "cat /etc/resolv.conf 看一下，然後把裡面的 nameserver 改成 8.8.8.8。",
        "hints": [
            "用 cat /etc/resolv.conf 觀察現在設定了哪些 nameserver。",
            "用編輯器把內容改成只留一行：nameserver 8.8.8.8。",
            "存檔後再 cat 一次確認。",
        ],
        # 驗證：有一行是精準的 "nameserver 8.8.8.8"
        "check_cmd": """
if grep -q '^nameserver 8\\.8\\.8\\.8$' /etc/resolv.conf 2>/dev/null; then
  echo OK;
fi
"""
    },
    {
        "id": "mid_user_lsa_missing",
        "desc": "使用者 lsa 不見了，或沒有 sudo 權限",
        "explain": (
            "題目 5：使用者 lsa 不見了 / 沒有 sudo 權限\n\n"
            "系統原本應該要有一個使用者 lsa，並且是 sudo 群組成員，\n"
            "現在 lsa 這個帳號被刪掉，或沒有在 sudo 群組裡。\n"
            "任務：重新建立 lsa 使用者，並讓它加入 sudo 群組。"
        ),
        "chaos_cmd": """
docker exec trainee bash -c '
  userdel -rf lsa 2>/dev/null || true
'
""",
        "hint": "用 id lsa 看看有沒有這個使用者，再檢查他是不是 sudo 群組成員。",
        "hints": [
            "先用 id lsa 測試：如果顯示 no such user，代表要重建帳號。",
            "用 useradd -m lsa 建立帳號，再用 passwd lsa 設定密碼。",
            "用 usermod -aG sudo lsa 把它加進 sudo 群組，再用 id lsa 檢查群組列表。",
        ],
        # 驗證：lsa 存在且是 sudo 群組成員
        "check_cmd": """
if id lsa >/dev/null 2>&1; then
  groups=$(id -nG lsa 2>/dev/null)
  for g in $groups; do
    if [ "$g" = "sudo" ]; then
      echo OK;
      break;
    fi
  done
fi
"""
    },
]

# ====== 題目查找 ======
def get_template_by_id(tid: str):
    for t in TEMPLATES:
        if t["id"] == tid:
            return t
    return None


# ====== 建立乾淨容器 ======
def init_container():
    """
    砍舊容器 → 開新容器 → 初始化 /var/www/html/index.html
    回傳 (ok: bool, err_msg: str)
    """
    # 1. 把舊容器刪掉（如果存在）
    run("docker rm -f trainee || true")

    # 2. 開一個新的容器
    out, err, code = run("docker run -d --name trainee meow-lab-image")
    if code != 0:
        return False, err

    # 3. 初始化場景（確保 index.html 在正確位置）
    init_cmd = """
docker exec trainee bash -c '
  mkdir -p /var/www/html &&
  echo "Welcome to Meow Server" > /var/www/html/index.html &&
  chmod 644 /var/www/html/index.html
'
"""
    run(init_cmd)
    return True, ""


# ====== 依序出題（改掉原本的 random） ======
_current_index = 0  # 全域 index，控制出題順序

def pick_random_template():
    """
    期中考模式：不使用 random，而是依序出題。
    第一次呼叫出第 0 題，第二次出第 1 題，以此類推，超過就從頭再來。
    """
    global _current_index
    if not TEMPLATES:
        return None

    t = TEMPLATES[_current_index]
    _current_index = (_current_index + 1) % len(TEMPLATES)
    return t


# ====== 檢查是否修好 ======
def check_template_done(template: dict) -> bool:
    """
    根據 template["check_cmd"] 檢查 trainee 容器是否已修復成功
    """
    if not template:
        return False

    check_cmd = f"""
docker exec trainee bash -c '
{template["check_cmd"]}
'
"""
    out, err, code = run(check_cmd)
    return "OK" in out
