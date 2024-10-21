// DOMが完全にロードされた後に実行される関数を登録します。
document.addEventListener('DOMContentLoaded', function() {
    // 個人データ、チームデータ、全データをロードするための関数を呼び出します
    loadPersonalData();
    loadTeam2Data();
    loadAllData();

    // データ登録ボタンクリック時にregisterData関数を呼び出す
    document.getElementById('registerButton').addEventListener('click', registerData);
    // 再読み込みボタンクリック時にconfirmRefresh関数を呼び出す
    document.getElementById('refreshButton').addEventListener('click', confirmRefresh);
});

// データ登録関数
async function registerData() {
    // フォームフィールドから値を取得
    const purposeIdx = document.getElementById('purposeIdx').value; // 修正：'purpose'から'purposeIdx'に変更
    const message = document.getElementById('message').value;
    const mean = document.getElementById('mean').value;
    const meanAddPhrase = document.getElementById('meanAddPhrase').value;
    const meanAddMor = document.getElementById('meanAddMor').value;
    const meanAddAll = document.getElementById('meanAddAll').value;
    const runningTime = document.getElementById('runningTime').value;
    const yesValue = document.getElementById('yesValue').value;
    const noValue = document.getElementById('noValue').value;

    // データオブジェクトを作成
    const data = {
        purposeIdx: purposeIdx, // 修正：'purpose'から'purposeIdx'に変更
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
        // サーバーにデータを送信
        const response = await fetch('http://3.38.151.167:8001/messages/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // データをJSON文字列に変換
        });

        if (response.ok) {
            // 成功した応答処理
            const result = await response.json();
            alert('データが成功裏に登録されました。');
            console.log(result);
        } else {
            // エラー応答処理
            const errorText = await response.text();
            alert(`データ登録に失敗しました。ステータスコード: ${response.status}. メッセージ: ${errorText}`);
            console.log(response.status, response.statusText);
        }
    } catch (error) {
        // ネットワークエラー処理
        alert('データ登録中にエラーが発生しました。');
        console.error('Error:', error);
    }
}

// 再読み込み確認関数
function confirmRefresh() {
    // ユーザーに再読み込みの確認
    if (confirm("再読み込みしますか？")) {
        location.reload(); // ページ再読み込み
    }
}

// チーム2データロード関数
async function loadTeam2Data() {
    try {
        // チーム2データ要求
        const response = await fetch('http://3.38.151.167:8001/messages2_short/');
        if (response.ok) {
            const messages = await response.json();
            const tableBody = document.querySelector('#team2Data tbody');
            tableBody.innerHTML = ''; // テーブル初期化

            // 各メッセージをテーブルに追加
            messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.message_id}</td>
                    <td>${message.message}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            // データロード失敗処理
            console.error('チームデータのロードに失敗しました', response.status, response.statusText);
        }
    } catch (error) {
        // ネットワークエラー処理
        console.error('チームデータのロード中にエラーが発生しました:', error);
    }
}

// 個人データ取得関数
async function loadPersonalData() {
    try {
        // 個人データ要求
        const response = await fetch('http://3.38.151.167:8001/fimessages/');
        if (response.ok) {
            const messages = await response.json();
            const tableBody = document.getElementById('personalData'); // 確定済み
            tableBody.innerHTML = ''; // テーブル初期化

            // 各メッセージをテーブルに追加
            for (const message of messages) {
                // テーブル行を生成
                const row = document.createElement('tr');

                // 各フィールドをテーブルデータセルに追加
                for (const key of Object.keys(message)) {
                    const cell = document.createElement('td');
                    cell.textContent = message[key];
                    row.appendChild(cell);

                    // sendDateフィールドの後に"メッセージ送信"ボタンを追加
                    if (key === 'sendDate') {
                        const buttonCell = document.createElement('td');
                        const sendButton = document.createElement('button');
                        sendButton.textContent = "メッセージ送信";
                        sendButton.onclick = async () => {
                            try {
                                const sendResponse = await fetch(`http://3.38.151.167:8001/messages/${message.message_id}/update_send_date`, {
                                    method: 'PUT'
                                });
                                if (sendResponse.ok) {
                                    alert(`メッセージID ${message.message_id} の送信時間が更新されました。`);
                                    // テーブル内の送信時間を更新
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

                // 行をテーブルに追加
                tableBody.appendChild(row);

                // answermessagesを呼び出し
                const answerResponse = await fetch(`http://3.38.151.167:8001/awmessages/${message.message_id}`);
                if (answerResponse.ok) {
                    const answerMessages = await answerResponse.json();
                    for (const answermessage of answerMessages) {
                        const answerRow = document.createElement('tr');
                        answerRow.innerHTML = `
                            <td>${answermessage.answerId}</td>
                            <td> </td>
                            <td>${answermessage.answer}</td>
                            <td>${answermessage.mean}</td>
                            <td>${answermessage.meanAddPhrase}</td>
                            <td>${answermessage.meanAddMor}</td>
                            <td>${answermessage.meanAddAll}</td>
                            <td> </td>
                            <td>${answermessage.sendDate}</td>
                            <td>${answermessage.receiveDate}</td>
                            <td> </td>
                            <td> </td>
                            <td>${answermessage.yesOrNo}</td>
                        `;
                        tableBody.appendChild(answerRow);
                    }
                } else {
                    console.error('回答メッセージのロードに失敗しました', answerResponse.status, answerResponse.statusText);
                }
            }
        } else {
            // データロード失敗処理
            console.error('個人データのロードに失敗しました', response.status, response.statusText);
        }
    } catch (error) {
        // ネットワークエラー処理
        console.error('個人データのロード中にエラーが発生しました:', error);
    }
}

// 全データ取得関数
async function loadAllData() {
    try {
        // 全データ要求
        const response = await fetch('http://3.38.151.167:8001/messages3_short/');
        if (response.ok) {
            const messages = await response.json();
            const tableBody = document.querySelector('#allData tbody');
            tableBody.innerHTML = ''; // テーブル初期化

            // 各メッセージをテーブルに追加
            messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.message_id}</td>
                    <td>${message.message}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            // データロード失敗処理
            console.error('全データのロードに失敗しました', response.status, response.statusText);
        }
    } catch (error) {
        // ネットワークエラー処理
        console.error('全データのロード中にエラーが発生しました:', error);
    }
}
