# Use PostgreSQL 14 Alpine image
FROM postgres:14-alpine

# Set environment variables
ENV POSTGRES_DB=vsphere_monitoring
ENV POSTGRES_USER=vsphere_user
ENV POSTGRES_PASSWORD=vsphere_password

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/
COPY schema.sql /docker-entrypoint-initdb.d/

# Copy custom PostgreSQL configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Expose port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pg_isready -U vsphere_user -d vsphere_monitoring || exit 1 