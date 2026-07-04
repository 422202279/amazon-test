import re


TERM_MAP = {
    "automatic": "自动",
    "cat": "猫",
    "dog": "狗",
    "feeder": "喂食器",
    "white": "白色",
    "black": "黑色",
    "green": "绿色",
    "blue": "蓝色",
    "red": "红色",
    "toy": "玩具",
    "interactive": "互动",
    "slow": "慢食",
    "pet": "宠物",
    "bed": "床",
    "heartbeat": "心跳",
    "simulator": "模拟器",
    "separation": "分离",
    "anxiety": "焦虑",
    "relief": "缓解",
    "battery": "电池",
    "timer": "定时器",
    "adjustable": "可调节",
    "pattern": "款式",
    "name": "名称",
}


def suggest_cn_title(text: str | None) -> str | None:
    source = normalize_text(text)
    if not source:
        return None
    words = re.split(r"[\s,/()\-:]+", source)
    translated = []
    for word in words:
      lower = word.lower()
      if not lower:
          continue
      translated.append(TERM_MAP.get(lower, word))
    result = " ".join(translated).strip()
    return result if result != source else f"中文解释待确认：{source}"


def suggest_cn_summary(text: str | None, max_len: int = 60) -> str | None:
    source = normalize_text(text)
    if not source:
        return None
    short = source[:max_len]
    translated = suggest_cn_title(short)
    if not translated:
        return None
    if len(source) > max_len:
        return f"{translated} ..."
    return translated


def normalize_text(text: str | None) -> str | None:
    if text is None:
        return None
    normalized = re.sub(r"\s+", " ", str(text)).strip()
    return normalized or None
