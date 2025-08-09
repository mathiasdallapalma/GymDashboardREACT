# FastAPITemplate
 
mathiasdallapalma: (.venv) met@met-HP-Laptop-15s-eq2xxx:~/Documents/GitHub/FastAPITemplate/backend$ psql -U postgres -h localhost -p 5433
Password for user postgres: 
psql (16.9 (Ubuntu 16.9-0ubuntu0.24.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off)
Type "help" for help.

postgres=# \du
                               List of roles
  Role name   |                         Attributes                         
--------------+------------------------------------------------------------
 fastapi_user | 
 postgres     | Superuser, Create role, Create DB, Replication, Bypass RLS

postgres=# GRANT ALL PRIVILEGES ON SCHEMA public TO fastapi_user;
ALTER ROLE fastapi_user SET search_path TO public;
GRANT
ALTER ROLE
postgres=# \q
(.venv) met@met-HP-Laptop-15s-eq2xxx:~/Documents/GitHub/FastAPITemplate/backend$ psql -U fastapi_user -h localhost -p 5433 -d fastapi_db
Password for user fastapi_user: 
psql (16.9 (Ubuntu 16.9-0ubuntu0.24.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off)
Type "help" for help.

fastapi_db=> CREATE TABLE test_table (id SERIAL PRIMARY KEY);
DROP TABLE test_table;
ERROR:  permission denied for schema public
LINE 1: CREATE TABLE test_table (id SERIAL PRIMARY KEY);
                     ^
ERROR:  table "test_table" does not exist
fastapi_db=> \q
(.venv) met@met-HP-Laptop-15s-eq2xxx:~/Documents/GitHub/FastAPITemplate/backend$ psql -U postgres -h localhost -p 5433
Password for user postgres: 
psql (16.9 (Ubuntu 16.9-0ubuntu0.24.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off)
Type "help" for help.

postgres=# ALTER SCHEMA public OWNER TO fastapi_user;
ALTER SCHEMA
postgres=# GRANT ALL PRIVILEGES ON SCHEMA public TO fastapi_user;
GRANT
postgres=# \dn+ public
                                List of schemas
  Name  |    Owner     |      Access privileges       |      Description       
--------+--------------+------------------------------+------------------------
 public | fastapi_user | fastapi_user=UC/fastapi_user+| standard public schema
        |              | =U/fastapi_user              | 
(1 row)

postgres=# \q
(.venv) met@met-HP-Laptop-15s-eq2xxx:~/Documents/GitHub/FastAPITemplate/backend$ psql -U fastapi_user -h localhost -p 5433 -d fastapi_db
Password for user fastapi_user: 
psql (16.9 (Ubuntu 16.9-0ubuntu0.24.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off)
Type "help" for help.

fastapi_db=> CREATE TABLE test_table (id SERIAL PRIMARY KEY);
DROP TABLE test_table;
ERROR:  permission denied for schema public
LINE 1: CREATE TABLE test_table (id SERIAL PRIMARY KEY);
                     ^
ERROR:  table "test_table" does not exist

GitHub Copilot: The issue seems to be related to insufficient permissions for the `fastapi_user` role on the `public` schema, even after granting privileges. To resolve this, we need to ensure that the `fastapi_user` role has ownership of the `public` schema and the necessary privileges to create and manage tables.

### [init_db.py](file:///home/met/Documents/GitHub/FastAPITemplate/backend/init_db.py)

Update the `ensure_permissions` function to include commands for altering the schema owner and granting all privileges on the schema to the `fastapi_user`.

````python
def ensure_permissions():
    """
    Ensure the database user has the necessary permissions.
    """
    with engine.connect() as connection:
        try:
            print("Granting necessary permissions to the database user...")
            connection.execute(text("ALTER SCHEMA public OWNER TO fastapi_user;"))
            connection.execute(text("GRANT ALL PRIVILEGES ON SCHEMA public TO fastapi_user;"))
            connection.execute(text("GRANT USAGE ON SCHEMA public TO fastapi_user;"))
            connection.execute(text("GRANT CREATE ON SCHEMA public TO fastapi_user;"))
            connection.execute(text("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fastapi_user;"))
            print("Permissions granted successfully.")
        except ProgrammingError as e:
            print(f"Error while granting permissions: {e}")
````

### Explanation of Changes:
1. **`ALTER SCHEMA public OWNER TO fastapi_user;`**: Ensures that `fastapi_user` owns the `public` schema.
2. **`GRANT ALL PRIVILEGES ON SCHEMA public TO fastapi_user;`**: Grants all privileges on the schema to `fastapi_user`.
3. Retained the existing commands for granting usage, create privileges, and altering default privileges.

After making these changes, re-run the script to ensure the permissions are correctly applied.

Made changes.

mathiasdallapalma: (.venv) met@met-HP-Laptop-15s-eq2xxx:~/Documents/GitHub/FastAPITemplate/backend$ python  init_db.py 
/met/Documents/GitHub/FastAPITemplate/backend/app/config.py:109: UserWarning: The value of FIRST_SUPERUSER_PASSWORD is "changethis", for security, please change it, at least for deployments.
  warnings.warn(message, stacklevel=1)
Granting necessary permissions to the database user...
Error while granting permissions: (psycopg.errors.InsufficientPrivilege) must be owner of schema public
[SQL: ALTER SCHEMA public OWNER TO fastapi_user;]
(Background on this error at: https://sqlalche.me/e/20/f405)
Creating database tables...
Traceback (most recent call last):
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 1961, in _exec_single_context
    self.dialect.do_execute(
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/default.py", line 944, in do_execute
    cursor.execute(statement, parameters)
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/psycopg/cursor.py", line 97, in execute
    raise ex.with_traceback(None)
psycopg.errors.InsufficientPrivilege: permission denied for schema public
LINE 2: CREATE TABLE "user" (
                     ^

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/init_db.py", line 63, in <module>
    init_db()
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/init_db.py", line 38, in init_db
    SQLModel.metadata.create_all(engine)
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/sql/schema.py", line 5924, in create_all
    bind._run_ddl_visitor(
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 3246, in _run_ddl_visitor
    conn._run_ddl_visitor(visitorcallable, element, **kwargs)
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 2453, in _run_ddl_visitor
    ).traverse_single(element)
      ^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/sql/visitors.py", line 661, in traverse_single
    return meth(obj, **kw)
           ^^^^^^^^^^^^^^^
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/sql/ddl.py", line 984, in visit_metadata
    self.traverse_single(
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/sql/visitors.py", line 661, in traverse_single
    return meth(obj, **kw)
           ^^^^^^^^^^^^^^^
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/sql/ddl.py", line 1022, in visit_table
    )._invoke_with(self.connection)
      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/sql/ddl.py", line 321, in _invoke_with
    return bind.execute(self)
           ^^^^^^^^^^^^^^^^^^
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 1413, in execute
    return meth(
           ^^^^^
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/sql/ddl.py", line 187, in _execute_on_connection
    return connection._execute_ddl(
           ^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 1524, in _execute_ddl
    ret = self._execute_context(
          ^^^^^^^^^^^^^^^^^^^^^^
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 1840, in _execute_context
    return self._exec_single_context(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 1980, in _exec_single_context
    self._handle_dbapi_exception(
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 2349, in _handle_dbapi_exception
    raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 1961, in _exec_single_context
    self.dialect.do_execute(
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/sqlalchemy/engine/default.py", line 944, in do_execute
    cursor.execute(statement, parameters)
  File "/home/met/Documents/GitHub/FastAPITemplate/backend/.venv/lib/python3.12/site-packages/psycopg/cursor.py", line 97, in execute
    raise ex.with_traceback(None)
sqlalchemy.exc.ProgrammingError: (psycopg.errors.InsufficientPrivilege) permission denied for schema public
LINE 2: CREATE TABLE "user" (
                     ^
[SQL: 
CREATE TABLE "user" (
        email VARCHAR(255) NOT NULL, 
        is_active BOOLEAN NOT NULL, 
        is_superuser BOOLEAN NOT NULL, 
        full_name VARCHAR(255), 
        id UUID NOT NULL, 
        hashed_password VARCHAR NOT NULL, 
        PRIMARY KEY (id)
)

]
(Background on this error at: https://sqlalche.me/e/20/f405)

GitHub Copilot: The error indicates that the `fastapi_user` role does not have sufficient privileges to alter the schema or create tables. This is likely because the `fastapi_user` role does not own the `public` schema, and the `ALTER SCHEMA public OWNER TO fastapi_user;` command fails due to insufficient privileges.

To resolve this, you need to ensure that the `postgres` user (or another superuser) assigns ownership of the `public` schema to `fastapi_user` before running the script. Since this cannot be done programmatically within the script due to privilege limitations, you must execute the following SQL commands manually as the `postgres` user:

### Manual SQL Commands
Run these commands in your PostgreSQL shell as the `postgres` user:
```sql
-- Log in as the postgres user
psql -U postgres -h localhost -p 5433

-- Assign ownership of the public schema to fastapi_user
ALTER SCHEMA public OWNER TO fastapi_user;

-- Grant all privileges on the public schema to fastapi_user
GRANT ALL PRIVILEGES ON SCHEMA public TO fastapi_user;

-- Exit the PostgreSQL shell
\q
```

### Updated Script
After manually fixing the schema ownership, you can run the script without further modifications. However, to avoid redundant errors in the future, you can add a check in the script to skip the `ALTER SCHEMA` command if it fails due to insufficient privileges.

Here is the updated `ensure_permissions` function:

````python
def ensure_permissions():
    """
    Ensure the database user has the necessary permissions.
    """
    with engine.connect() as connection:
        try:
            print("Granting necessary permissions to the database user...")
            try:
                connection.execute(text("ALTER SCHEMA public OWNER TO fastapi_user;"))
            except ProgrammingError:
                print("Skipping ALTER SCHEMA as the current user lacks sufficient privileges.")
            connection.execute(text("GRANT ALL PRIVILEGES ON SCHEMA public TO fastapi_user;"))
            connection.execute(text("GRANT USAGE ON SCHEMA public TO fastapi_user;"))
            connection.execute(text("GRANT CREATE ON SCHEMA public TO fastapi_user;"))
            connection.execute(text("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fastapi_user;"))
            print("Permissions granted successfully.")
        except ProgrammingError as e:
            print(f"Error while granting permissions: {e}")
````

### Explanation of Changes:
1. **Try-Except for `ALTER SCHEMA`**: The `ALTER SCHEMA` command is wrapped in a `try-except` block to handle cases where the script is run by a non-superuser.
2. **Graceful Handling**: If the `ALTER SCHEMA` command fails, the script will print a warning and continue with the remaining commands.

### Next Steps:
1. Execute the manual SQL commands as the `postgres` user to fix the schema ownership.
2. Run the updated script to ensure permissions and initialize the database.

Made changes.

mathiasdallapalma: last time i changed a config system file from peer to md5

GitHub Copilot: Changing the PostgreSQL authentication method from `peer` to `md5` in the configuration file (`pg_hba.conf`) ensures that users authenticate with a password instead of relying on system user matching. Below is a step-by-step guide to verify and apply this change.

### Steps to Verify and Apply the Change:
1. Locate the `pg_hba.conf` file:
   - The file is typically located in the PostgreSQL data directory. You can find its location by running:
     ```bash
     psql -U postgres -c "SHOW hba_file;"
     ```

2. Open the `pg_hba.conf` file for editing:
   ```bash
   sudo nano /path/to/pg_hba.conf
   ```

3. Look for the line(s) that specify `peer` authentication for local connections. It will look something like this:
   ```
   local   all             all                                     peer
   ```

4. Change `peer` to `md5` to enforce password authentication:
   ```
   local   all             all                                     md5
   ```

5. Save the file and exit the editor.

6. Restart the PostgreSQL service to apply the changes:
   ```bash
   sudo systemctl restart postgresql
   ```

7. Test the connection using a password:
   ```bash
   psql -U postgres -h localhost -p 5433
   ```

### Additional Notes:
- Ensure that the PostgreSQL user (`fastapi_user` in your case) has a password set. You can set or reset the password using:
  ```sql
  ALTER USER fastapi_user WITH PASSWORD 'your_password';
  ```

- If you encounter issues, check the PostgreSQL logs for more details:
  ```bash
  sudo tail -f /var/log/postgresql/postgresql-<version>-main.log
  ```

Let me know if you need further assistance!