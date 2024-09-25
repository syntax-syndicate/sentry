import time
from datetime import datetime, timedelta
from uuid import uuid4

from snuba_sdk import DeleteQuery, Request

from sentry.snuba.dataset import Dataset, StorageKey
from sentry.testutils.cases import SnubaTestCase, TestCase
from sentry.utils import snuba


class SnubaTest(TestCase, SnubaTestCase):
    def test_basic(self) -> None:
        # insert a new issue
        now = datetime.now()
        occurrence_id = uuid4()
        issue = (
            2,
            "insert",
            {
                "group_id": 1,
                "message": "message",
                "platform": "python",
                "primary_hash": "1" * 32,
                "event_id": "a" * 32,
                "project_id": self.project.id,
                "datetime": now.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
                "data": {"received": time.mktime(now.timetuple())},
                "occurrence_data": {
                    "detection_time": time.mktime(now.timetuple()),
                    "fingerprint": ["hi"],
                    "issue_title": "myissue",
                    "id": id,
                    "type": 1,
                },
                "organization_id": 6,
            },
        )
        self.store_issues([issue])

        # make sure its there
        assert snuba.query(
            dataset=Dataset.IssuePlatform,
            start=now - timedelta(days=1),
            end=now + timedelta(days=1),
            groupby=["project_id"],
            filter_keys={"project_id": [self.project.id]},
            referrer="testing.test",
            tenant_ids={"referrer": "testing.test", "organization_id": 1},
        ) == {self.project.id: 1}

        # delete it
        req = Request(
            dataset=Dataset.IssuePlatform.value,
            app_id="my_app",
            query=DeleteQuery(
                StorageKey.SearchIssues.value,
                {"project_id": [self.project.id], "occurrence_id": [str(occurrence_id)]},
            ),
            tenant_ids={"referrer": "testing.test", "organization_id": 1},
        )
        snuba.raw_snql_query(req, use_cache=False)
        time.sleep(4)

        # check that it's gone
        response = snuba.query(
            dataset=Dataset.IssuePlatform,
            start=now - timedelta(days=1),
            end=now + timedelta(days=1),
            groupby=["project_id"],
            filter_keys={"project_id": [self.project.id]},
            referrer="testing.test",
            tenant_ids={"referrer": "testing.test", "organization_id": 1},
            use_cache=False,
        )
        assert response == {}
