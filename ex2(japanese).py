from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from databases import Database
from datetime import datetime
import pytz
import logging

# FastAPIアプリケーションの初期化
app = FastAPI()

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # すべてのオリジンを許可
    allow_credentials=True,
    allow_methods=["*"],  # すべてのHTTPメソッドを許可
    allow_headers=["*"],  # すべてのヘッダーを許可
)

# データベース接続文字列
DATABASE_URL1 = "mysql://セキュリティのために削除しました。/boardDB1_bds4"
DATABASE_URL2 = "mysql://セキュリティのために削除しました。/boardDB2_bds4"
DATABASE_URL3 = "mysql://セキュリティのために削除しました。/boardDB3_bds4"

# データベースオブジェクトの生成
database1 = Database(DATABASE_URL1)
database2 = Database(DATABASE_URL2)
database3 = Database(DATABASE_URL3)

# ロギングの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 日本の現地時間を返す関数
def get_japan_local_time():
    tz = pytz.timezone('Asia/Tokyo')
    japan_time = datetime.now(tz)
    return japan_time.strftime('%Y-%m-%d %H:%M:%S')

# アプリケーション起動時にデータベース接続
@app.on_event("startup")
async def startup():
    logger.info("Starting up...")
    await database1.connect()
    await database2.connect()
    await database3.connect()

# アプリケーション終了時にデータベース接続を切断
@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down...")
    await database1.disconnect()
    await database2.disconnect()
    await database3.disconnect()

# メッセージ生成データモデル
class FirstMessageCreate(BaseModel):
    purposeIdx: str  # purposeからpurposeIdxに修正
    message: str
    mean: float
    meanAddPhrase: float
    meanAddMor: float
    meanAddAll: float
    runningTime: str
    yesValue: float
    noValue: float

# メッセージ応答データモデル
class FirstMessage(BaseModel):
    message_id: str
    purpose: Optional[str] = None
    message: Optional[str] = None
    mean: Optional[float] = None
    meanAddPhrase: Optional[float] = None
    meanAddMor: Optional[float] = None
    meanAddAll: Optional[float] = None
    runningTime: Optional[str] = None
    yesValue: Optional[float] = None
    noValue: Optional[float] = None
    createdDate: Optional[str] = None
    confirmStatus: Optional[bool] = False

# 最後のメッセージIDを取得して次のメッセージIDを生成
async def get_next_message_id():
    query = "SELECT messageId FROM firstmessages ORDER BY createdDate DESC LIMIT 1"
    result = await database1.fetch_one(query)
    if result is None:
        return "2-4-1"
    
    last_id = result["messageId"]
    base_id, count = last_id.rsplit("-", 1)
    new_count = int(count) + 1
    return f"{base_id}-{new_count}"

# メッセージ生成エンドポイントの追加
@app.post("/messages/")
async def create_message(message: FirstMessageCreate):
    # 新しいメッセージIDを生成
    next_message_id = await get_next_message_id()

    # メッセージデータベースに保存
    query = """
        INSERT INTO firstmessages (
            messageId, purposeIdx, message, mean, meanAddPhrase, meanAddMor, meanAddAll, runningTime, yesValue, noValue, createdDate, confirmStatus
        ) VALUES (
            :message_id, :purposeIdx, :message, :mean, :meanAddPhrase, :meanAddMor, :meanAddAll, :runningTime, :yesValue, :noValue, :createdDate, :confirmStatus
        )
    """
    values = {
        "message_id": next_message_id,
        "purposeIdx": message.purposeIdx,
        "message": message.message,
        "mean": message.mean,
        "meanAddPhrase": message.meanAddPhrase,
        "meanAddMor": message.meanAddMor,
        "meanAddAll": message.meanAddAll,
        "runningTime": message.runningTime,
        "yesValue": message.yesValue,
        "noValue": message.noValue,
        "confirmStatus": 0,  # デフォルト値として設定
        "createdDate": get_japan_local_time()
    }
    
    try:
        # すべてのデータベースに同じデータを挿入
        await database1.execute(query, values)
        await database2.execute(query, values)
        await database3.execute(query, values)
        return {**values, "message_id": next_message_id}
    except Exception as e:
        logger.error(f"Error creating message in firstmessages: {e}")  # ここもfirstmessagesを修正
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

# 個人データ照会エンドポイント (DB1からすべての詳細を照会)
@app.get("/fimessages/")
async def read_messages1():
    query = """
        SELECT messageId AS message_id, purposeIdx AS purpose, message, mean, meanAddPhrase, meanAddMor, meanAddAll, runningTime, sendDate, yesValue, noValue, confirmStatus
        FROM firstmessages;
    """
    try:
        results = await database1.fetch_all(query)
        return results
    except Exception as e:
        logger.error(f"Error fetching messages from firstmessages: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@app.get("/awmessages/")
async def read_messages1():
    query = """
        SELECT *
        FROM answermessages;
    """
    try:
        results = await database1.fetch_all(query)
        return results
    except Exception as e:
        logger.error(f"Error fetching messages from firstmessages: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

# メッセージ照会エンドポイント (DB2からメッセージIDとメッセージを照会)
@app.get("/messages2_short/")
async def read_messages2_short():
    query = "SELECT messageId AS message_id, message FROM firstmessages;"
    try:
        results = await database2.fetch_all(query)
        return results
    except Exception as e:
        logger.error(f"Error fetching messages from firstmessages: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

# 全体データ照会エンドポイント (DB3からメッセージIDとメッセージを照会)
@app.get("/messages3_short/")
async def read_messages3_short():
    query = "SELECT messageId AS message_id, message FROM firstmessages;"
    try:
        results = await database3.fetch_all(query)
        return results
    except Exception as e:
        logger.error(f"Error fetching messages from firstmessages: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

# SendDateの更新エンドポイント
@app.put("/messages/{message_id}/update_send_date")
async def update_send_date(message_id: str):
    japan_time = get_japan_local_time()
    query = """
        UPDATE firstmessages
        SET sendDate = :sendDate
        WHERE messageId = :messageId
    """
    values = {
        "sendDate": japan_time,
        "messageId": message_id
    }
    try:
        await database1.execute(query, values)
        await database2.execute(query, values)
        await database3.execute(query, values)
        return {"message_id": message_id, "sendDate": japan_time}
    except Exception as e:
        logger.error(f"Error updating sendDate for messageId {message_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
