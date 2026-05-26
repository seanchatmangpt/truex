# Experimental Project Report: pigsty

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/pigsty`

## 1. Audit Status
- **Test Status:** ⚠️ No Tests Found / Not Executable

## 2. Executable Entry Points
- `pigsty/Makefile`
- `pigsty/app/bytebase/Makefile`
- `pigsty/app/dify/Makefile`
- `pigsty/app/electric/Makefile`
- `pigsty/app/ferretdb/Makefile`
- `pigsty/app/gitea/Makefile`
- `pigsty/app/jupyter/Makefile`
- `pigsty/app/kong/Makefile`
- `pigsty/app/mattermost/Makefile`
- `pigsty/app/metabase/Makefile`
- `pigsty/app/minio/Makefile`
- `pigsty/app/nocodb/Makefile`
- `pigsty/app/odoo/Makefile`
- `pigsty/app/pg_exporter/Makefile`
- `pigsty/app/pgadmin/Makefile`
- `pigsty/app/pgweb/Makefile`
- `pigsty/app/polardb/Makefile`
- `pigsty/app/postgrest/Makefile`
- `pigsty/app/supabase/Makefile`
- `pigsty/app/wiki/Makefile`
- `pigsty/terraform/Makefile`

## 3. Extracted Documentation & Context
### Source: `pigsty/README.md`
```markdown
# Pigsty

[![Webite: pigsty.io](https://img.shields.io/badge/website-pigsty.io-slategray?style=flat&logo=cilium&logoColor=white)](https://pigsty.io)
[![Docs](https://img.shields.io/badge/docs-slategray?style=flat&logo=cilium&logoColor=white)](https://pigsty.io/docs)
[![Version: v3.4.1](https://img.shields.io/badge/version-v3.4.1-slategray?style=flat&logo=cilium&logoColor=white)](https://github.com/pgsty/pigsty/releases/tag/v3.4.1)
[![License: AGPLv3](https://img.shields.io/github/license/pgsty/pigsty?logo=opensourceinitiative&logoColor=green&color=slategray)](https://pigsty.io/docs/about/license/)
[![GitHub Stars](https://img.shields.io/github/stars/pgsty/pigsty?style=flat&logo=github&logoColor=black&color=slategray)](https://star-history.com/#pgsty/pigsty&Date)
[![Extensions: 405](https://img.shields.io/badge/extensions-405-%233E668F?style=flat&logo=postgresql&logoColor=white&labelColor=3E668F)](https://pigsty.io/ext/list)

Battery-Included, Local-First **PostgreSQL** Distribution as a Free & Better **RDS** Alternative!

> "**P**ostgreSQL **I**n **G**reat **STY**le": **P**ostgres, **I**nfras, **G**raphics, **S**ervice, **T**oolbox, it's all **Y**ours.

[Website](https://pigsty.io/) | [Org](https://github.com/pgsty) | [Docs](https://pigsty.io/docs/) | [Extensions](https://pigsty.io/ext/) | [Values](https://pigsty.io/about/values) | [Demo](https://demo.pigsty.cc) | [Blog](https://pigsty.io/blog) | [Discuss](https://github.com/orgs/pgsty/discussions) | [Support](https://pigsty.io/price) | [中文站点](https://pigsty.cc) | [博客](https://pigsty.cc/blog)

[![pigsty-desc](https://pigsty.io/img/pigsty/banner.en.jpg)](https://pigsty.io/about/values)

**Self-Hosting PostgreSQL RDS like a Pro!** [Get Started](https://pigsty.io/docs/setup/install/) with the latest [v3.4.1](https://github.com/pgsty/pigsty/releases/tag/v3.4.1) release:

```bash
curl -fsSL https://repo.pigsty.io/get | bash -s v3.4.1
```


--------

## Features

- [**Extensible**](https://pigsty.io/about/extensibility/): **405** [**PG Extensions**](https://pigsty.io/ext/list) & **8** [**PG Kernel**](https://pigsty.io/docs/kernel) available, with [**MsSQL**](https://pigsty.io/docs/kernel/babelfish/), [**Oracle**](https://pigsty.io/docs/kernel/ivorysql/), [**MySQL**](https://pigsty.io/docs/kernel/openhalo/), [**Mongo**](https://pigsty.io/docs/ferret) compatibility.
- [**Reliable**](https://pigsty.io/about/reliability/): Self-healing [**HA**](https://pigsty.io/docs/concept/ha/) clusters with pre-configured [**PITR**](https://pigsty.io/docs/pgsql/arch#point-in-time-recovery) and built-in [**ACL**](https://pigsty.io/docs/pgsql/acl), [**CA & SSL**](https://pigsty.io/docs/reference/param/#ca) secure best practice.
- [**Observable**](https://pigsty.io/about/observability/): SOTA monitoring for [**PG**](https://demo.pigsty.cc/d/pgrds-instance/pgrds-instance) / [**Infra**](https://pigsty.io/docs/infra) / [**Node**](https://pigsty.io/docs/node) based on **Prometheus** & **Grafana** stack: [**Demo**](https://demo.pigsty.cc) & [**Gallery**](https://github.com/pgsty/pigsty/wiki/Gallery).
- [**Scalable**](https://pigsty.io/about/scalability/): Auto-routed & pooled customizable database [**Services**](https://pigsty.io/docs/concept/svc#default-service) [**Access**](https://pigsty.io/docs/concept/svc#access-service) with **haproxy**, **pgbouncer**, and **VIP**.
- [**Maintainable**](https://pigsty.io/about/maintainability/): [**One-Cmd Install**](https://pigsty.io/docs/setup/install), [**Admin SOP**](https://pigsty.io/docs/pgsql/admin), **Auto-Tune**, **Local Repo**, [**IaC**](https://pigsty.io/docs/pgsql/config) and [**Vagrant**](https://pigsty.io/docs/setup/provision#vagrant) / [**Terraform**](https://pigsty.io/docs/setup/provision#terraform) support.
- [**Composable**](https://pigsty.io/about/composability/): Bonus [**Modules**](https://pigsty.io/docs/about/modules) such as [**Redis**](https://pigsty.io/docs/redis), [**MinIO**](https://pigsty.io/docs/minio), [**Etcd**](https://pigsty.io/docs/etcd), [**Docker**](https://pigsty.io/docs/app), [**DuckDB**](https://pigsty.io/docs/pro/duckdb), [**FerretDB**](https://pigsty.io/docs/ferret), [**Supabase**](https://pigsty.io/docs/kernel/supabase/), [**& More**](https://pigsty.io/docs/pro/)!
- [**Controllable**](https://pigsty.io/about/controllability/): Self-sufficient [**Infra Closure**](https://pigsty.io/docs/infra/), Cloud Neutral FOSS. Run on [**bare Linux**](https://pigsty.io/docs/reference/compatibility/) without [**Docker & K8S**](https://pigsty.io/blog/db/db-in-k8s/)!
- [**Affordable**](https://pigsty.io/about/affordability/): Self-Hosting like a [**Pro**](https://pigsty.io/price/), without the cost of DBA / [**RDS**](https://pigsty.io/blog/cloud/rds/). Empowering Cloud-Exit to [**save 90%+!**](https://pigsty.io/docs/reference/cost/)

[![landscape](https://pigsty.io/img/pigsty/ecosystem.jpg)](https://pigsty.io/ext/list)


...
```

### Source: `pigsty/app/README.md`
```markdown
# App

Here are some docker compose templates for popular applications that works well with PostgreSQL

* [Supabase](supabase/) : The open source Firebase alternative, built on Postgres
* [FerretDB](ferretdb/) : Open Source MongoDB alternative, built on Postgres
* [PolarDB](polardb/) : Open Source RAC alternative, built on Postgres
* [PgAdmin4](pgadmin/) : Postgres Admin Tools
* [PgWeb](pgweb/) : Postgres Web Console
* [ByteBase](bytebase/) : Postgres DDL Migration
* [PostgREST](postgrest/) : Auto-Generated PG Backend REST API
* [Kong](kong/) : Kong API Gateway
* [Gitea](gitea/) : Self-Hosting Git Services
* [Wiki](wiki/) : Local Wiki Service
* [NocoDB](nocodb/) : Open source airtable alternative
* [Odoo](odoo/) : Open Source ERP
* [Dify](dify/) : Open Source AI Workflow Platform for GenAI Apps.
* [Metabase](metabase/) : Fast analytics with the friendly UX and integrated tooling
* [Jupyter](jupyter/) : Run jupyter notebook, the data analysis IDE with docker
* etc....


**Docker**

You can install docker with the [`docker.yml`](https://github.com/pgsty/pigsty/blob/master/docker.yml) playbook. 
If you wish to use a mirror, add them to `docker_registry_mirrors`. To use another registry: 

```bash
docker login quay.io
````


**Portals**

There are several predefined portals

```yaml
postgrest : { domain: api.pigsty  ,endpoint: "127.0.0.1:8884"   }
pgadmin   : { domain: adm.pigsty  ,endpoint: "127.0.0.1:8885"   }
pgweb     : { domain: cli.pigsty  ,endpoint: "127.0.0.1:8886"   }
...
```

### Source: `pigsty/app/bytebase/README.md`
```markdown
# Bytebase

Bytebase: https://www.bytebase.com/

open-source schema migrator for PostgreSQL (and other databases)

Check public demo: http://ddl.pigsty.cc, username: `admin@pigsty.cc`, password: `pigsty`

If you want to access bytebase through SSL, you have to trust `files/pki/ca/ca.crt` on your browser (or use the dirty hack `thisisunsafe` in chrome)


## Get Started

Check [`.env`](.env) file for configurable environment variables:

```bash
BB_PORT=8887
BB_DOMAIN=http://ddl.pigsty
BB_PGURL="postgresql://dbuser_bytebase:DBUser.Bytebase@10.10.10.10:5432/bytebase?sslmode=prefer"
```

Then launch bytebase with:

```bash
make up  # docker compose up
```

Visit [http://ddl.pigsty](http://ddl.pigsty) or http://10.10.10.10:8887

## Makefile

```bash
make up         # pull up bytebase with docker compose in minimal mode
make run        # launch bytebase with docker , local data dir and external PostgreSQL
make view       # print bytebase access point
make log        # tail -f bytebase logs
make info       # introspect bytebase with jq
make stop       # stop bytebase container
make clean      # remove bytebase container
make pull       # pull latest bytebase image
...
```

*(Plus 25 other markdown files)*
