from __future__ import annotations

from sentry.taskworker.config import taskregistry
from sentry.taskworker.retry import Retry

demotasks = taskregistry.create_namespace(
    name="demos", topic="hackweek", deadletter_topic="hackweek-dlq", retry=None
)


@demotasks.register(name="taskdemo.hello")
def say_hello(name):
    """Say hello to a name"""
    print(f"hello {name}")


@demotasks.register(name="taskdemo.hello", retry=Retry(times=5, on=(KeyError,)))
def broken(runtime: str):
    """Do something or raise an error"""
    if runtime == "boom":
        raise ValueError("it went boom")
    if runtime == "safeboom":
        raise KeyError("it went safeboom retry")
    print(f"runtime {runtime}")
