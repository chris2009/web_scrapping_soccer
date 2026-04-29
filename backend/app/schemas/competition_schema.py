from pydantic import BaseModel, ConfigDict


class CompetitionRead(BaseModel):
    id: int
    name: str
    slug: str
    region: str | None = None

    model_config = ConfigDict(from_attributes=True)

