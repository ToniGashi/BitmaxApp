# toni-gashi-training

### To get started locally

1)  npm install
2)  docker build -t my-postgres-db ./ (builds the docker image)
3)  docker images -a (check if the image is successfully built)
4)  docker run -d --name my-postgresdb-container -p 5432-5432 my-postgres-db (runs a container on port 5432 from the image my-postgres-db)

This database created will have a prepared schema by task.sql which is run in the dockerfile.
Now we can run the code locally and make changes to that database.

You should be specifying your set up on a .env file: 
    # In our case
    DB_USER=postgres
    DB_PASSWORD=docker
    DB_HOST=localhost
    ### Technically this should be the port where your docker postgres container is running but I know that this could be changed automatically so make sure to check docker to see in which post your container is running or if that port is being used by some other service. You can use this command: 
    docker container ls
    DB_PORT=5432
    DB_DATABASE=task
    # This is the JWT secret I used, but you can use whatever
    JWT_SECRET_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY0NTE3NTkwOSwiaWF0IjoxNjQ1MTc1OTA5fQ.
    dLkC05v_PwdXUmEVdFcyazlrV_zeaZlb1ftSjqr9ohM
    # This will store the access token for the authentication.
    JWT_ACCESS_TOKEN
    # This will store the BCRYPT_SALT
    BCRYPT_SALT=10

1)  node app.js
2)  hit the endpoints through postman with a body. (do not forget the password and the email have to be in a specific format) (regular stuff) 
Technically at this point your users db would be empty and you could not create a user without logging in. You would have to remove the authenticateJWT middleware from the function createUser, create a user and then add the middleware back to test it. However, I have changed added these credentials to the database from the dockerfile entrypoint: tonigashi@gmail.com | !ToniGashi2
