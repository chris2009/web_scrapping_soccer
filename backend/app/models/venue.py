from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Venue(Base):
    __tablename__ = "venues"
    __table_args__ = (
        UniqueConstraint("name", "country_id", name="uq_venues_name_country"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    city: Mapped[str | None] = mapped_column(String(120))
    country_id: Mapped[int | None] = mapped_column(ForeignKey("countries.id"))

    country = relationship("Country", back_populates="venues")
    matches = relationship("Match", back_populates="venue")

