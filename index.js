const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser"); 

const app = express(); 
const cors=require("cors");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "wellwo",
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL: " + err.stack);
        return;
    }
    console.log("Connected to MySQL as id " + connection.threadId);
});

const port = 8080;
app.listen(port, () => {
    console.log("Server is running on port " + port);
});

//USER


app.get("/user/:userId", (req, res)=>{
    const { userId } = req.params;
    connection.query('SELECT * from users WHERE userId = ?', [userId], (error, results)=> {
        if (error) {
            console.error("Error executing query:"+ error);
            res.status(500).send("Error retrieving users");
            return;
        }
        res.json(results);
    });
});

app.get("/users", (req, res)=>{
    connection.query('SELECT * from users ', (error, results)=> {
        if (error) {
            console.error("Error executing query:"+ error);
            res.status(500).send("Error retrieving users");
            return;
        }
        res.json(results);
    });
});

app.post("/register", (req, res) => {
    const {user_name, email, password } = req.body;
    const hashedPassword= bcrypt.hashSync(password, 10)
    connection.query("INSERT INTO users (user_name, email, password) VALUES  (?,?,?)", [ user_name, email, hashedPassword], (error, results) => {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error adding data");
            return;
        }
        res.json(results);
    });
});


app.post("/login", function(req, response)  {
    const { email, password } = req.body;
    if (!email || !password) {
        console.log("not complete");
        response.send("not complete");
        return;
    }

    connection.query("SELECT * FROM users WHERE email=?", [email], function(error, result) {
        if (error) {
            console.error("Error executing query: " + error);
            response.status(500).send("Error creating user");
            return;
        }
        if (result.length === 0) {
            console.log(`User with email: ${email} doesn't exist in the database`);
            response.status(409).send("user not found");
            return;
        }
        const hashedPassword = result[0].password.replace("$2y$", "$2a$");   
        console.log("bichsen password", password);
        console.log("hereglegchiin password", hashedPassword)     
        bcrypt.compare(password, hashedPassword, (err, passmatch) => {
            console.log("ererererere", passmatch)
            if (passmatch) {
                console.log("Successful login"); response.send({success: true, data: result[0]})
            } else {
                console.log("Incorrect password");response.status(500).send({err:"password wrong"})
            }
        });
    });
});


//COMPANY

app.get("/company/all", (req, res)=>{
    connection.query('SELECT * FROM company ', (error, results)=> {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error retrieving company");
            return;
        }
        res.json(results);
    });
});

app.get("/company/:companyId", (req, res)=>{
    const { companyId } = req.params;
    connection.query('SELECT * FROM company WHERE companyId = ?', [companyId], (error, results)=> {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error retrieving company");
            return;
        }
        res.json(results);
    });
});


app.post("/company/register", (req, res) => {
    const {company_name, company_register, email, password, country, field_of_operation, location, created_year, instagram, facebook, website, vision, mission, add_information } = req.body;
    const hashedPassword= bcrypt.hashSync(password, 10)
    connection.query("INSERT INTO company (company_name, company_register, email, password, country, field_of_operation, location, created_year, instagram, facebook, website, vision, mission, add_information) VALUES  (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [ company_name, company_register, email, hashedPassword, country, field_of_operation, location, created_year, instagram, facebook, website, vision, mission, add_information], (error, results) => {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error adding data");
            return;
        }
        res.json(results);
    });
});

app.post("/company/login", function(req, response)  {
    const { email, password } = req.body;
    if (!email || !password) {
        console.log("not complete");
        response.send("not complete");
        return;
    }

    connection.query("SELECT * FROM company WHERE email=?", [email], function(error, result) {
        if (error) {
            console.error("Error executing query: " + error);
            response.status(500).send("Error creating user");
            return;
        }
        if (result.length === 0) {
            console.log(`User with email: ${email} doesn't exist in the database`);
            response.status(409).send("user not found");
            return;
        }
        
        bcrypt.compare(password, result[0].password, (err, passmatch) => {
            if (passmatch) {
                console.log("Successful login"); response.send({success: true})
            } else {
                console.log("Incorrect password");response.send({err:"password wrong"})
            }
        });
    });
});

app.patch('/company/edit/:companyId', (req, res) => {
    const { companyId } = req.params
    const { company_name, company_register, email, country, field_of_operation, location, created_year, instagram, facebook, website, vision, mission, add_information } = req.body;
    connection.query(`UPDATE company set company_name="${company_name}", company_register=${company_register}, email="${email}", country="${country}", field_of_operation="${field_of_operation}",location="${location}", created_year=${created_year}, instagram="${instagram}", facebook="${facebook}", website="${website}", vision="${vision}", mission="${mission}", add_information="${add_information}" WHERE companyId = ${companyId}`, [companyId, company_name, company_register, email, country, field_of_operation, location, created_year, instagram, facebook, website, vision, mission, add_information], (error, results) => {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error updating company");
            return;
        }
        res.status(200).send("Successful");
    });
});



app.patch('/company/edit/one/:companyId', (req, res) => {
    const { companyId } = req.params
    const { email, field_of_operation, location, created_year, website } = req.body;
    connection.query(`UPDATE company set email="${email}", field_of_operation="${field_of_operation}",location="${location}", created_year=${created_year}, website="${website}" WHERE companyId = ${companyId}`, [email, field_of_operation, location, created_year, website], (error, results) => {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error updating company");
            return;
        }
        res.status(200).send("Successful");
    });
});

app.patch('/company/edit/two/:companyId', (req, res) => {
    const { companyId } = req.params
    const { instagram, facebook, website} = req.body;
    connection.query(`UPDATE company set instagram="${instagram}", facebook="${facebook}", website="${website}" WHERE companyId = ${companyId}`, [instagram, facebook, website], (error, results) => {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error updating company");
            return;
        }
        res.status(200).send("Successful");
    });
});

app.patch('/company/edit/three/:companyId', (req, res) => {
    const { companyId } = req.params
    const { vision, mission, add_information} = req.body;
    connection.query(`UPDATE company set vision="${vision}", mission="${mission}", add_information="${add_information}" WHERE companyId = ${companyId}`, [vision, mission, add_information], (error, results) => {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error updating company");
            return;
        }
        res.status(200).send("Successful");
    });
});

app.get("/home/company", (req, res)=>{
    connection.query('SELECT companyId, company_name from company ', (error, results)=> {
        if (error) {
            console.error("Error executing query:"+ error);
            res.status(500).send("Error retrieving company");
            return;
        }
        res.json(results);
    });
});

//JOB

app.get("/jobs", (req, res)=>{
    connection.query('SELECT * from job ', (error, results)=> {
        if (error) {
            console.error("Error executing query:"+ error);
            res.status(500).send("Error retrieving job");
            return;
        }
        res.json(results);
    });
});


app.get("/job/:jobId", (req, res)=>{
    const { jobId} = req.params;
    connection.query('SELECT * from job WHERE jobId = ?',[jobId], (error, results)=> {
        if (error) {
            console.error("Error executing query:"+ error);
            res.status(500).send("Error retrieving job");
            return;
        }
        res.json(results);
    });
});

app.post('/post/job', (req, res) => {
    const {
      companyId,
      job_name,
      role,
      salary,
      opportunities,
      location,
      time_type,
      add_information,
      company_information,
      requirements

    } = req.body;
    connection.query("INSERT INTO job (companyId, job_name, role, salary, opportunities, location, time_type, add_information, company_information, requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [companyId, job_name, role, salary, opportunities, location, time_type, add_information, company_information, requirements], (error, results) => {
        if (error) {
            console.error("Error executing query: " + error);
            res.status(500).send("Error adding data");
            return;
        }
        res.json(results);
    });
  });
  

  app.get("/card", (req, res)=>{
    connection.query('SELECT job_name, salary, created_date, location from job', (error, results)=> {
        if (error) {
            console.error("Error executing query:"+ error);
            res.status(500).send("Error retrieving job");
            return;
        }
        res.json(results);
    });
});

///CV
  app.get("/cv", (req, res)=>{
    connection.query('SELECT * from CV ', (error, results)=> {
        if (error) {
            console.error("Error executing query:"+ error);
            res.status(500).send("Error retrieving job");
            return;
        }
        res.json(results);
    });
});
app.post('/post/cv', (req, res) => {
    const {
         userId, user_surname, register_number, birthdate, gender, city, district, location, working_company, authority, started_working, ended_working, occupation, skill, add_information
    } = req.body;
    
    const sql = "INSERT INTO CV ( userId, user_surname, register_number, birthdate, gender, city, district, location, working_company, authority, started_working, ended_working, occupation, skill, add_information) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    const values = [ userId, user_surname, register_number, birthdate, gender, city, district, location, working_company, authority, started_working, ended_working, occupation, skill, add_information];
    
    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error("Error executing query:", error);
            return res.status(500).send("Error inserting CV data");
        }
        res.json(results);
    });
});