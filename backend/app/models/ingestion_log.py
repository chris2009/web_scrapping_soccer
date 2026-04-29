from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class IngestionLog(Base):
    __tablename__ = "ingestion_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    competition_id: Mapped[int | None] = mapped_column(ForeignKey("competitions.id"))
    data_source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    status: Mapped[str] = mapped_column(String(40), nullable=False)
    records_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_inserted: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_updated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    competition = relationship("Competition")
    data_source = relationship("DataSource", back_populates="ingestion_logs")

