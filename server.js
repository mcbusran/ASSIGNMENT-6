/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part of this
*  assignment has been copied manually or electronically from any other source (including web sites) or 
*  distributed to other students.
* 
*  Name: _Myra Busran_____ Student ID: __127033223______ Date: ___August 7, 2023_
*
*  Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 

const express = require("express");
const path = require("path");
const collegeData = require("C:/WEB700_OTHERS/ASSIGNMENT 6/web700-app/modules/collegeData");
const exphbs = require('express-handlebars');

const app = express();
const HTTP_PORT = process.env.PORT || 8103;

// Create an instance of Handlebars engine
const hbs = exphbs.create({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        equal: function (val1, val2, options) {
            return val1 === val2 ? options.fn(this) : options.inverse(this);
        },
        navLink: function(url, options) {
            return '<li' + (url === app.locals.activeRoute ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        }
    }
});

// Set the view engine to the created Handlebars instance
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to set active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Route to handle root URL and render "home" view
app.get("/", (req, res) => {
    res.render("home");
});

// Route to handle /students page
app.get("/students", async (req, res) => {
    try {
        const students = await collegeData.getAllStudents();
        console.log(students); // Add this line to check the retrieved students
        if (students.length > 0) {
            res.render("students", { students });
        } else {
            res.render("students", { message: "No students available" });
        }
    } catch (error) {
        console.error("Error getting students:", error);
        res.render("students", { message: "An error occurred while fetching students" });
    }
});

// Route to handle /students/add page
app.get("/students/add", (req, res) => {
    collegeData.getCourses() // Use collegeData.getCourses
        .then((courses) => {
            res.render("addStudent", { courses: courses });
        })
        .catch(() => {
            res.render("addStudent", { courses: [] });
        });
});

// Route to handle form submission for updating student details
app.post("/students/update", async (req, res) => {
    try {
        const updatedStudent = req.body;
        await collegeData.updateStudent(updatedStudent);
        res.redirect("/student");
    } catch (error) {
        console.error("Error updating student details:", error);
        res.redirect("/students"); // Redirect to the students list page
    }
});

// Route to handle /courses page
app.get("/courses", async (req, res) => {
    try {
        const courses = await collegeData.getCourses();
        if (courses.length > 0) {
            res.render("courses", { courses });
        } else {
            res.render("courses", { message: "No courses available" });
        }
    } catch (error) {
        console.error("Error getting courses:", error);
        res.render("courses", { message: "An error occurred while fetching courses" });
    }
});

// Route to handle individual course details
app.get("/course/:id", async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await collegeData.getCourseById(courseId);
        res.render("course", { course: course });
    } catch (error) {
        console.error("Error retrieving course:", error);
        res.status(500).send("Error retrieving course");
    }
});

// Route to handle individual student details
app.get("/student/:studentNum", async (req, res) => {
    try {
        const studentNum = req.params.studentNum;
        const student = await collegeData.getStudentByNum(studentNum);
        const courses = await collegeData.getCourses();

        for (const course of courses) {
            course.selected = course.courseId === student.course;
        }

        // Use viewData: { student, courses } to pass data to the view
        res.render("student", { viewData: { student, courses } });
    } catch (error) {
        res.render("student", { viewData: { errorMessage: "Error retrieving student details" } });
    }
});

// Route to handle adding a new student
app.get("/addStudent", (req, res) => {
    // Use the correct template name "addStudent" instead of "student"
    res.render("addStudent");
});

// Route to handle form submission for updating student details
app.post("/student/update", async (req, res) => {
    try {
        const updatedStudent = req.body;
        await collegeData.updateStudent(updatedStudent);
        res.redirect("/students");
    } catch (error) {
        console.error("Error updating student details:", error);
        res.redirect("/students");
    }
});

// Route to handle form submission for adding a student
app.post("/addStudent", (req, res) => {
    const studentData = req.body;
    collegeData.addStudent(studentData)
        .then(() => {
            res.redirect("/student");
        })
        .catch((error) => {
            console.error("Error adding student:", error);
            res.status(500).send("Error adding student");
        });
});

// Route to handle TAs page
app.get("/tas", async (req, res) => {
    try {
        const students = await collegeData.getAllStudents();
        const tas = students.filter(student => student.TA);
        if (tas.length > 0) {
            res.render("tas", { tas: tas });
        } else {
            res.render("tas", { errorMessage: "No TAs available" });
        }
    } catch (error) {
        res.render("tas", { errorMessage: error.message });
    }
});

// Route to handle /about page
app.get("/about", (req, res) => {
    res.render("about");
});

// Route to handle HTML demo page
app.get("/htmlDemo", (req, res) => {
    res.render("htmlDemo");
});

// Route to handle unmatched routes
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize collegeData and start the server
collegeData
    .initialize()
    .then(() => {
        app.listen(HTTP_PORT, onHttpStart);
    })
    .catch((err) => {
        console.error("Error initializing collegeData:", err);
    });

// Function to execute after the HTTP server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

// Add Course Form (GET)
app.get("/courses/add", (req, res) => {
    res.render("addCourse");
});

// Add Course Form (POST)
app.post("/courses/add", (req, res) => {
    const courseData = req.body;
    collegeData.addCourse(courseData)
        .then(() => {
            res.redirect("/courses");
        })
        .catch((error) => {
            console.error("Error adding course:", error);
            res.status(500).send("Error adding course");
        });
});

// Update Course Form (POST)
app.post("/course/update", (req, res) => {
    const updatedCourse = req.body;
    collegeData.updateCourse(updatedCourse)
        .then(() => {
            res.redirect("/courses");
        })
        .catch((error) => {
            console.error("Error updating course:", error);
            res.redirect("/courses");
        });
});

// View Course Details
app.get("/course/:id", (req, res) => {
    const courseId = req.params.id;
    collegeData.getCourseById(courseId)
        .then((course) => {
            if (!course) {
                res.status(404).send("Course Not Found");
            } else {
                res.render("course", { course: course });
            }
        })
        .catch((error) => {
            console.error("Error fetching course details:", error);
            res.redirect("/courses");
        });
});

// Delete Course
app.get("/course/delete/:id", (req, res) => {
    const courseId = req.params.id;
    collegeData.deleteCourseById(courseId)
        .then(() => {
            res.redirect("/courses");
        })
        .catch((error) => {
            console.error("Error deleting course:", error);
            res.status(500).send("Unable to Remove Course / Course not found");
        });
});

app.get("/student/:studentNum", (req, res) => {
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum)
        .then((studentData) => {
            viewData.student = studentData || null;
        })
        .catch(() => {
            viewData.student = null;
        })
        .then(collegeData.getCourses) // Use collegeData.getCourses
        .then((coursesData) => {
            viewData.courses = coursesData;

            for (let course of viewData.courses) {
                course.selected = course.courseId === viewData.student.course;
            }
        })
        .catch(() => {
            viewData.courses = [];
        })
        .then(() => {
            if (viewData.student === null) {
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData });
            }
        });
});

app.get("/student/delete/:studentNum", async (req, res) => {
    try {
        const studentNum = req.params.studentNum;
        await collegeData.deleteStudentByNum(studentNum);
        res.redirect("/students");
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).send("Unable to Remove Student / Student not found");
    }
});
