// DOMが完全に読み込まれた後に実行される関数を登録します。
document.addEventListener('DOMContentLoaded', function() {
    // 個人データ、チームデータ、全データをロードするための関数を呼び出します
    loadPersonalData();
    loadTeam2Data();
    loadAllData();

    // データ登録ボタンがクリックされたときにregisterData関数を呼び出します
    document.getElementById('registerButton').addEventListener('click', registerData);
    // 更新ボタンがクリックされたときにconfirmRefresh関数を呼び出します
    document.getElementById('refreshButton').addEventListener('click', confirmRefresh);
});

// データ登録関数
async function registerData() {
    // フォームフィールドから値を取得します
    const purposeIdx = document.getElementById('purposeIdx').value;
    const message = document.getElementById('message').value;
    const mean = document.getElementById('mean').value;
    const meanAddPhrase = document.getElementById('meanAddPhrase').value;
    const meanAddMor = document.getElementById('meanAddMor').value;
    const meanAddAll = document.getElementById('meanAddAll').value;
    const runningTime = document.getElementById('runningTime').value;
    const yesValue = document.getElementById('yesValue').value;
    const noValue = document.getElementById('noValue').value;

    // データオブジェクトを作成します
    const data = {
        purposeIdx: purposeIdx,
        message: message,
        mean: parseFloat(mean),
        meanAddPhrase: parseFloat(meanAddPhrase),
        meanAddMor: parseFloat(meanAddMor),
        meanAddAll: parseFloat(meanAddAll),
        runningTime: runningTime,
        yesValue: parseFloat(yesValue),
        noValue: parseFloat(noValue)
    };

    try {
        // サーバーにデータを送信します
        const response = await fetch('http://57.180.41.44:5004/messages/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // 成功した応答を処理します
            const result = await response.json();
            alert('データが成功裏に登録されました。');
            console.log(result);
        } else {
            // エラー応答を処理します
            const errorText = await response.text();
            alert(`データ登録に失敗しました。ステータスコード: ${response.status}。メッセージ: ${errorText}`);
            console.log(response.status, response.statusText);
        }
    } catch (error) {
        // ネットワークエラーを処理します
        alert('データ登録中にエラーが発生しました。');
        console.error('Error:', error);
    }
}

// 更新確認関数
function confirmRefresh() {
    // ユーザーに更新の確認をします
    if (confirm("更新しますか？")) {    
        location.reload(); // ページを更新します
    }
}

// チーム2データをロードする関数
async function loadTeam2Data() {
    try {
        // チーム2データを要求します
        const response = await fetch('http://57.180.41.44:5004/messages2_short/');
        if (response.ok) {
            const messages = await response.json();
            const tableBody = document.querySelector('#team2Data tbody');
            tableBody.innerHTML = ''; // テーブルを初期化します

            // 各メッセージをテーブルに追加します
            messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.message_id}</td>
                    <td>${message.message}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            // データのロード失敗を処理します
            console.error('チームデータのロードに失敗しました', response.status, response.statusText);
        }
    } catch (error) {
        // ネットワークエラーを処理します
        console.error('チームデータをロード中にエラーが発生しました:', error);
    }
}

// 個人データ取得関数
async function loadPersonalData() {
    try {
        // 個人データを要求します
        const response = await fetch('http://57.180.41.44:5004/fimessages/');
        if (response.ok) {
            const messages = await response.json();
            const tableBody = document.getElementById('personalData');
            tableBody.innerHTML = ''; // テーブルを初期化します

            // 各メッセージをテーブルに追加します
            for (const message of messages) {
                const row = document.createElement('tr');

                for (const key of Object.keys(message)) {
                    const cell = document.createElement('td');
                    cell.textContent = message[key];
                    row.appendChild(cell);

                    if (key === 'sendDate') {
                        const buttonCell = document.createElement('td');
                        const sendButton = document.createElement('button');
                        sendButton.textContent = "メッセージを送信";
                        sendButton.onclick = async () => {
                            try {
                                const sendResponse = await fetch(`http://57.180.41.44:5004/messages/${message.message_id}/update_send_date`, {
                                    method: 'PUT'
                                });
                                if (sendResponse.ok) {
                                    alert(`メッセージID ${message.message_id} の送信時間が更新されました。`);
                                    const updatedMessage = await sendResponse.json();
                                    cell.textContent = updatedMessage.sendDate;
                                } else {
                                    console.error('メッセージの送信に失敗しました', sendResponse.status, sendResponse.statusText);
                                }
                            } catch (error) {
                                console.error('メッセージ送信中にエラーが発生しました:', error);
                            }
                        };
                        buttonCell.appendChild(sendButton);
                        row.appendChild(buttonCell);
                    }
                }

                tableBody.appendChild(row);
            }
        } else {
            console.error('個人データのロードに失敗しました', response.status, response.statusText);
        }
    } catch (error) {
        console.error('個人データをロード中にエラーが発生しました:', error);
    }
}

// 全データ取得関数
async function loadAllData() {
    try {
        // 全データを要求します
        const response = await fetch('http://57.180.41.44:5004/messages3_short/');
        if (response.ok) {
            const messages = await response.json();
            const tableBody = document.querySelector('#allData tbody');
            tableBody.innerHTML = ''; // テーブルを初期化します

            // 各メッセージをテーブルに追加します
            messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.message_id}</td>
                    <td>${message.message}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            console.error('全データのロードに失敗しました', response.status, response.statusText);
        }
    } catch (error) {
        console.error('全データをロード中にエラーが発生しました:', error);
    }
}
