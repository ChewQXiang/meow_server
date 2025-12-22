// src/ssh.js
const { Client } = require('ssh2');
const fs = require('fs');

function runSSH({ host, port = 22, username, privateKeyPath, command }) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const privateKey = privateKeyPath ? fs.readFileSync(privateKeyPath) : undefined;

    let stdout = '';
    let stderr = '';

    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) { conn.end(); return reject(err); }
        stream.on('close', (code) => {
          conn.end();
          resolve({ code, stdout, stderr });
        });
        stream.on('data', (d) => stdout += d.toString());
        stream.stderr.on('data', (d) => stderr += d.toString());
      });
    }).on('error', reject)
      .connect({ host, port, username, privateKey });
  });
}

module.exports = { runSSH };
