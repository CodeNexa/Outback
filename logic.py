"""
Byte Quest: a 3-round troubleshooting quiz that teaches real first-response
steps and rewards a discount code for a good score.

Stateless by design: the client sends its current score back with each
answer, and the server returns the updated score plus the next scenario.
This means a free single-instance host needs no session storage or sticky
sessions -- any instance can answer any request, which matters once you
scale to multiple backend instances behind a load balancer.
"""

from ..models import GameAnswerResult, GameOption, GameScenario

SCENARIOS: list[GameScenario] = [
    GameScenario(
        id="s1",
        prompt="A laptop won't power on at all, not even the charging light. What's the first thing you check?",
        options=[
            GameOption(id="a", label="Reinstall the operating system"),
            GameOption(id="b", label="Try a different power outlet and cable"),
            GameOption(id="c", label="Replace the motherboard"),
            GameOption(id="d", label="Run a virus scan"),
        ],
    ),
    GameScenario(
        id="s2",
        prompt="A user reports the computer is 'very slow' since yesterday. What's the fastest useful first step?",
        options=[
            GameOption(id="a", label="Open Task Manager / Activity Monitor to check resource usage"),
            GameOption(id="b", label="Buy a new computer"),
            GameOption(id="c", label="Reformat the hard drive"),
            GameOption(id="d", label="Ignore it, it'll resolve itself"),
        ],
    ),
    GameScenario(
        id="s3",
        prompt="Wi-Fi drops every few minutes across the whole office, only on this floor. Best next move?",
        options=[
            GameOption(id="a", label="Restart every laptop one by one"),
            GameOption(id="b", label="Check the floor's access point / router for overheating or firmware issues"),
            GameOption(id="c", label="Change everyone's desktop wallpaper"),
            GameOption(id="d", label="Uninstall the browser"),
        ],
    ),
]

CORRECT_ANSWERS = {"s1": "b", "s2": "a", "s3": "b"}
EXPLANATIONS = {
    "s1": "Power issues are almost always cable, outlet or charger faults before anything internal.",
    "s2": "Checking active processes tells you whether it's one runaway app, malware, or genuine hardware strain -- before you do anything drastic.",
    "s3": "A pattern isolated to one floor points at shared infrastructure (the access point), not individual machines.",
}
POINTS_PER_CORRECT = 10
REWARD_THRESHOLD = 20
REWARD_CODE = "BYTEQUEST10"


def first_scenario() -> GameScenario:
    return SCENARIOS[0]


def evaluate(scenario_id: str, option_id: str, current_score: int) -> GameAnswerResult:
    correct = CORRECT_ANSWERS.get(scenario_id) == option_id
    points = POINTS_PER_CORRECT if correct else 0
    total = current_score + points

    index = next((i for i, s in enumerate(SCENARIOS) if s.id == scenario_id), -1)
    next_scenario = SCENARIOS[index + 1] if 0 <= index < len(SCENARIOS) - 1 else None

    reward = REWARD_CODE if next_scenario is None and total >= REWARD_THRESHOLD else None

    return GameAnswerResult(
        correct=correct,
        explanation=EXPLANATIONS.get(scenario_id, ""),
        pointsAwarded=points,
        totalScore=total,
        nextScenario=next_scenario,
        rewardCode=reward,
    )
