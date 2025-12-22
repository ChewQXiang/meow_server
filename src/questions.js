// src/questions.js
module.exports = [
  { id: 1, title: "Nginx 服務故障", difficulty: "easy", type: "service", fault_id: "fault_01", check_id: "check_01",
    body: "網站打不開了，請修復讓 nginx 恢復運作。\n提示：systemctl", fault_path: "/opt/faults/fault_01.sh", check_path: "/opt/checks/check_01.sh" },
  { id: 2, title: "SSH 服務故障", difficulty: "easy", type: "service", fault_id: "fault_02", check_id: "check_02",
    body: "SSH 連線異常，請修復 ssh 服務。\n提示：systemctl status ssh", fault_path: "/opt/faults/fault_02.sh", check_path: "/opt/checks/check_02.sh" },
  { id: 3, title: "DNS 解析錯誤", difficulty: "medium", type: "dns", fault_id: "fault_03", check_id: "check_03",
    body: "DNS 解析失敗，請修復讓解析恢復。\n提示：/etc/resolv.conf", fault_path: "/opt/faults/fault_03.sh", check_path: "/opt/checks/check_03.sh" },
];