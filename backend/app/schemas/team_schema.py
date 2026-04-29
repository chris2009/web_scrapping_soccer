from pydantic import BaseModel, ConfigDict


class TeamRead(BaseModel):
    id: int
    name: str
    slug: str
    country_name: str | None = None

    model_config = ConfigDict(from_attributes=True)

