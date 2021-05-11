# TOST - Trip Outlier Scoring Tool

## Backend
### Requirements

- [python](https://www.python.org/) >= 3.6
- [psycopg2](https://github.com/psycopg/psycopg2) - PostgreSQL database adapter for Python

We are using p3 venv

All the dependencies are saved as an environment file on the root directory. The file name is `environment.yml`. You can create the environment with all the dependencies using conda.
```
conda env create -f environment.yml
```
This will create a conda environment named `tost`. You can then verify the new environment is installed correctly running  `conda env list`

To activate the environment run `conda activate tost`

## Dataset and Database
### Requirements
- [Postgres](https://www.postgresql.org/) - PostgreSQL, A relational DB solution
- [Postgis](https://postgis.net/) - A Postgres extention to work with geometries and geographical datatype

The dataset used in this work is composed of trips between the ports of Houston and New Orleans between 2009 and 2014. This dataset is composed of two csv files.

The sample data is available at this google drive shared [folder](https://drive.google.com/drive/folders/1B7WlfLfyh9IBGbic61i9bDycJSFasKiA?usp=sharing)

A PostgreSQL (aka Postgres) database is used to store the raw trip and vessel data for ease of pre-processing and querying. To populate the database from the raw AIS data, the below steps need to be followed - 
  
  1. Create a database in Postgre named `tost-db`
  2. Run the sql create statements in the `/database-scripts` directory in the given sequence in the filename prefix (v01-v06). Running all these create statements will create all the required table in the `tost-db` database
  3. When the tables are there, to fill in the tables from the raw AIS data in the available csv files, first download the csv files from the shared Google drive folder. Then, in the `/scripts` directory there are python scripts to read in the csv files and write in the database table. <br>
  Change the username and password to your Postgres username and password in the _db_connection.py_ file

  1. Running all the python scripts in the sequence _script1_ to _script9_, will 
 




## Server

For the sake of consistency we are using the same language for the server as for the scripts. The server-side is a python _flask_ application.

### Requirements

- [flask](https://palletsprojects.com/p/flask/)

### Flask

```
pip install flask
```

# TODO

* Add different segment sizes
* Add itinarary table which will have a origin and destination
