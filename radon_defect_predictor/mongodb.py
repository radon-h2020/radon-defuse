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

    def get_repositories(self) -> list:
        return [document for document in self.db.repositories.find({})]

    def get_repository(self, id: str):
        return self.db.repositories.find_one({'id': id})

    def add_repository(self, repo: dict):
        """
        Insert a new repository if it does not exist in the database.
        :param repo: the repository to insert
        :return: the inserted id; None if already exists
        """
        repository = self.get_repository(repo['id'])
        if repository:
            return None
        else:
            return self.db.repositories.insert_one(repo)

    def replace_repository(self, repo: dict):
        return self.db.repositories.replace_one({'id': repo['id']}, repo)
