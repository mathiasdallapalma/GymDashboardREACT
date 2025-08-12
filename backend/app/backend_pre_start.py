import logging

from sqlalchemy import Engine
from sqlmodel import Session, select
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed
from google.cloud import firestore

from app.config import settings
from app.database_engine import firestore_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

max_tries = 60 * 5  # 5 minutes
wait_seconds = 1




@retry(
    stop=stop_after_attempt(max_tries),
    wait=wait_fixed(wait_seconds),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def init_firestore(client: firestore.Client) -> None:
    try:
        # Try to access Firestore to check if it's available
        # Create a test collection reference and check if we can access it
        test_ref = client.collection('_test_connection')
        # This will raise an exception if Firestore is not accessible
        list(test_ref.limit(1).stream())
    except Exception as e:
        logger.error(e)
        raise e


def main() -> None:
    logger.info("Initializing service")
    
    if settings.USE_FIREBASE:
        logger.info("Testing Firestore connection")
        if not firestore_client:
            raise Exception("Firestore client not initialized")
        init_firestore(firestore_client)

    
    logger.info("Service finished initializing")


if __name__ == "__main__":
    main()
