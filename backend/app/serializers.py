from datetime import date, datetime


def to_dict(model) -> dict:
    data = {}
    for column in model.__table__.columns:
        value = getattr(model, column.name)
        if isinstance(value, (datetime, date)):
            data[column.name] = value.isoformat()
        else:
            data[column.name] = value
    return data
