# TOST - Trip Outlier Scoring Tool

# Backend
## Requirements

- [python](https://www.python.org/) >= 3.6
- [postgres](https://www.postgresql.org/)
- [postgis](https://postgis.net/) - Is an postgres extention to work with geometries and geography
- [psycopg2](https://github.com/psycopg/psycopg2) - PostgreSQL database adapter for Python

We are using p3 venv

All the dependencies are saved as an environment file on the root directory. The file name is `environment.yml`. You can create the environment with all the dependencies using conda.
```
conda env create -f environment.yml
```
This will create a conda environment named `tost`. You can then verify the new environment is installed correctly running  `conda env list`

To activate the environment run `conda activate tost`

# Server

For the sake of consistency we are using the same language for the server as for the scripts.

## Requirements

*[flask](https://palletsprojects.com/p/flask/)

### Flask

```
pip install flask
```

# TODO

* Add different segment sizes
* Add itinarary table which will have a origin and destination
