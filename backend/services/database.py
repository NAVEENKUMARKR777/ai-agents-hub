from motor.motor_asyncio import AsyncIOMotorClient
from models.user import User
from models.token import Token
from models.agent import Agent
from datetime import datetime
from bson import json_util, ObjectId
import json

class Database:
    client: AsyncIOMotorClient = None

    @classmethod
    def get_database(cls):
        return cls.client.ai_agents_hub

    @classmethod
    async def connect_to_database(cls, uri: str):
        cls.client = AsyncIOMotorClient(uri)
        await cls.client.admin.command('ping')
        print("Connected to MongoDB!")

    @classmethod
    async def close_database_connection(cls):
        cls.client.close()
        print("Closed MongoDB connection!")

    @classmethod
    async def get_user(cls, wallet_address: str):
        user = await cls.get_database().users.find_one({"wallet_address": wallet_address})
        return user

    @classmethod
    async def create_user(cls, user: User):
        user_dict = user.dict()
        await cls.get_database().users.insert_one(user_dict)
        return user_dict

    @classmethod
    async def update_user_login(cls, wallet_address: str):
        await cls.get_database().users.update_one(
            {"wallet_address": wallet_address},
            {"$set": {"last_login": datetime.now()}}
        )

    @classmethod
    async def save_token(cls, token: Token):
        try:
            token_dict = token.dict()
            result = await cls.get_database().tokens.insert_one(token_dict)
            if result.inserted_id:
                saved_token = await cls.get_database().tokens.find_one({"_id": result.inserted_id})
                saved_token["_id"] = str(saved_token["_id"])
                return saved_token
            raise Exception("Failed to save token")
        except Exception as e:
            print(f"Database error saving token: {str(e)}")
            raise

    @classmethod
    async def get_user_tokens(cls, wallet_address: str):
        try:
            cursor = cls.get_database().tokens.find(
                {"wallet_address": wallet_address}
            ).sort("createdAt", -1)
            tokens = await cursor.to_list(length=None)
            for token in tokens:
                token["_id"] = str(token["_id"])
            return tokens
        except Exception as e:
            print(f"Database error getting user tokens: {str(e)}")
            raise

    @classmethod
    async def delete_token(cls, mint_address: str):
        try:
            result = await cls.get_database().tokens.delete_one({"mint": mint_address})
            if result.deleted_count == 0:
                raise Exception("Token not found")
            return True
        except Exception as e:
            print(f"Database error deleting token: {str(e)}")
            raise

    @classmethod
    async def save_agent(cls, agent: Agent):
        try:
            agent_dict = agent.dict()
            result = await cls.get_database().agents.insert_one(agent_dict)
            if result.inserted_id:
                saved_agent = await cls.get_database().agents.find_one({"_id": result.inserted_id})
                saved_agent["_id"] = str(saved_agent["_id"])
                return saved_agent
            raise Exception("Failed to save agent")
        except Exception as e:
            print(f"Database error saving agent: {str(e)}")
            raise

    @classmethod
    async def get_user_agents(cls, wallet_address: str):
        try:
            cursor = cls.get_database().agents.find(
                {"wallet_address": wallet_address}
            ).sort("created_at", -1)
            agents = await cursor.to_list(length=None)
            for agent in agents:
                agent["_id"] = str(agent["_id"])
            return agents
        except Exception as e:
            print(f"Database error getting user agents: {str(e)}")
            raise

    @classmethod
    async def update_agent_status(cls, agent_id: str, status: str, last_action: datetime = None):
        try:
            update_data = {"status": status}
            if last_action:
                update_data["last_action"] = last_action
            result = await cls.get_database().agents.update_one(
                {"_id": ObjectId(agent_id)},
                {"$set": update_data}
            )
            if result.modified_count == 0:
                raise Exception("Agent not found")
            return True
        except Exception as e:
            print(f"Database error updating agent status: {str(e)}")
            raise

    @classmethod
    async def delete_agent(cls, agent_id: str):
        try:
            result = await cls.get_database().agents.delete_one({"_id": ObjectId(agent_id)})
            if result.deleted_count == 0:
                raise Exception("Agent not found")
            return True
        except Exception as e:
            print(f"Database error deleting agent: {str(e)}")
            raise

    @classmethod
    async def update_agent_metrics(cls, agent_id: str, metrics: dict):
        try:
            result = await cls.get_database().agents.update_one(
                {"_id": ObjectId(agent_id)},
                {
                    "$set": {
                        "performance_metrics": metrics,
                        "last_action": datetime.now()
                    }
                }
            )
            if result.modified_count == 0:
                raise Exception("Agent not found")
            return True
        except Exception as e:
            print(f"Database error updating agent metrics: {str(e)}")
            raise