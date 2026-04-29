from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Season(Base):
    __tablename__ = "seasons"
    __table_args__ = (
        UniqueConstraint("competition_id", "name", name="uq_seasons_competition_name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    competition_id: Mapped[int] = mapped_column(ForeignKey("competitions.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(40), nullable=False)
    year_start: Mapped[int | None] = mapped_column()
    year_end: Mapped[int | None] = mapped_column()

    competition = relationship("Competition", back_populates="seasons")
    matches = relationship("Match", back_populates="season")

