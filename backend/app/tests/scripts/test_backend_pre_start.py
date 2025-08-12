from unittest.mock import MagicMock, patch

from app.backend_pre_start import init_firestore, logger


def test_init_successful_connection() -> None:
    firestore_client_mock = MagicMock()
    
    collection_mock = MagicMock()
    limit_mock = MagicMock()
    stream_mock = MagicMock(return_value=[])
    
    limit_mock.configure_mock(**{"stream.return_value": stream_mock})
    collection_mock.configure_mock(**{"limit.return_value": limit_mock})
    firestore_client_mock.configure_mock(**{"collection.return_value": collection_mock})

    with (
        patch.object(logger, "info"),
        patch.object(logger, "error"),
        patch.object(logger, "warn"),
    ):
        try:
            init_firestore(firestore_client_mock)
            connection_successful = True
        except Exception:
            connection_successful = False

        assert (
            connection_successful
        ), "The Firestore connection should be successful and not raise an exception."

        assert firestore_client_mock.collection.called, "The client should access a collection."
        assert collection_mock.limit.called, "The collection should be limited."
        assert limit_mock.stream.called, "The query should be streamed."
