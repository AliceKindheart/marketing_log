Marketing Log [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
=============
This app was designed to help a small marketing team license technologies. 

## Demo
Check out a live version of the web application [here](https://the-zen-of-marketing.herokuapp.com/).

## Features
- The app stores information about companies that may be interested in technologies, ![companies](https://i.imgur.com/Dv24rf9.png) as well as specific contacts at each company. ![each company](https://i.imgur.com/tjo8p1s.png)
- Users can apply tags to companies, contacts, or technologies
- Once a marketing campaign has been started for a technology, the app will suggest companies to contact based on matching tags ![matching tags](https://i.imgur.com/EsqgdJ3.png)
- Within a marketing campaign, users can track what companies have been contacted, what the outcome of that contact has been, as well as set a reminder date to follow up with the company ![create event](https://i.imgur.com/A3HHsyz.png)
- When creating an event, users have the option to send an email through the app using Outlook to selected companies or contacts. Users also have the option to record contact with multiple companies and/or multiple contacts while only creating a single event. 
- When a user views their active marketing campaigns, they can see a list of all events that have been marked for follow up. Events overdue for follow up are highlighted in red. ![follow up](https://i.imgur.com/dMsTqPd.png)
- Users can add a follow-up event for events needing follow up ![create follow up](https://i.imgur.com/WSmu96K.png)

## Tools Used
This is almost a standard MEAN-stack application, but rather than using all of the standard elements of a MEAN app (MongoDB, Express, Angular, and Node), MongoDB and its ORM, Mongoose, has been replaced with MySQL and the ORM Sequelize. This was done to allow the end users to more easily import/export data using Excel.

### NPM Modules
- Passport - Passport is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application. A comprehensive set of strategies support authentication using a username and password, Facebook, Twitter, and more.
- Express - Express is a minimal and flexible node.js web application framework, providing a robust set of features for building single and multi-page, and hybrid web applications.
- Sequelize - The Sequelize library provides easy access to MySQL, MariaDB, SQLite or PostgreSQL databases by mapping database entries to objects and vice versa. To put it in a nutshell, it's an ORM (Object-Relational-Mapper). The library is written entirely in JavaScript and can be used in the Node.JS environment.

### Javascript Tools
- Grunt - In one word: automation. The less work you have to do when performing repetitive tasks like minification, compilation, unit testing, linting, etc, the easier your job becomes. After you've configured it, Grunt can do most of that mundane work for you—and your team—with basically zero effort.

  1.  It watches your filesystem and when it detects a change it will live-reload your changes.

  2.  It runs jshint which looks through your javascript files and ensures coding standards.

  3.  It runs nodemon which watches changes in specific folders and recompiles the app when necessary. No running node app.js every 2 minutes.

  4.  It can also run tests like mocha and karma for you.
  
- Bower - Bower is a package manager for the web. It offers a generic, unopinionated solution to the problem of front-end package management, while exposing the package dependency model via an API that can be consumed by a more opinionated build stack. There are no system wide dependencies, no dependencies are shared between different apps, and the dependency tree is flat.

### Front-End Tools
- Angular.js - AngularJS is an open-source JavaScript framework, maintained by Google, that assists with running single-page applications. Its goal is to augment browser-based applications with model–view–controller (MVC) capability, in an effort to make both development and testing easier.
- Twitter Bootstrap - Sleek, intuitive, and powerful mobile first front-end framework for faster and easier web development.
- UI Bootstrap - Bootstrap components written in pure AngularJS by the AngularUI Team

## Credits
This application uses Open Source components. You can find the source code of the open source project along with license information below. I acknowledge and am grateful to these developers for their contributions to open source!

- Project - [mean-stack-relational](https://github.com/jpotts18/mean-stack-relational)
- License - (MIT) https://github.com/jpotts18/mean-stack-relational/blob/master/LICENSE
