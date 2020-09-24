import os
from dotenv import load_dotenv
from pymongo import MongoClient


class MongoDBManager:
    __instance = None

    def __init__(self):
        if MongoDBManager.__instance is None:
            load_dotenv()

            self.client = MongoClient(os.getenv('MONGO_DB_HOST'), int(os.getenv('MONGO_DB_PORT')))
            self.db = self.client[os.getenv('MONGO_DB_NAME')]
            MongoDBManager.__instance = self
        else:
            raise Exception("You cannot create another MongoDBManager class")

    @staticmethod
    def get_instance():
        """ Static method to fetch the current instance.
        """
        if not MongoDBManager.__instance:
            MongoDBManager()
        return MongoDBManager.__instance

    def db_exists(self) -> bool:
        return 'iac_miner' in self.client.list_database_names()

    def get_all_repos(self) -> list:
        return [document for document in self.db.repositories.find({})]

    def get_single_repo(self, id: str):
        return self.db.repositories.find_one({'id': id})

    def add_repo(self, repo: dict):
        repo_id = self.db.repositories.insert_one(repo).inserted_id
        return repo_id

    def replace_repo(self, repo: dict):
        return self.db.repositories.replace_one({'id': repo['id']}, repo)
