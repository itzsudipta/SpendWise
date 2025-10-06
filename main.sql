-- Table creations section
CREATE TABLE user_data (

user_id int primary key,
user_name varchar(50),
user_email varchar(30) ,
user_password varchar(50),
created_at timestamp


);

CREATE TABLE  category (

cy_id int primary key,
user_id int,
FOREIGN KEY(user_id) REFERENCES user_data(user_id),
cy_name varchar(20) NOT NULL


);

CREATE TABLE  expense (

ex_id int primary key,
user_id int,
FOREIGN KEY(user_id) REFERENCES user_data(user_id),
cy_id int,
FOREIGN KEY(cy_id) REFERENCES category(cy_id),
ex_amount decimal,
ex_desc text,
ex_data date,
created_at timestamp

);

CREATE TABLE  Budget (

b_id int primary key,
user_id int,
FOREIGN KEY(user_id) REFERENCES user_data(user_id),
b_mnth date,
limit_amount decimal,
created_at timestamp



);

-- Table modification (Alter section)

Alter Table user_data
	Alter Column user_password Type varchar(255);

Alter Table user_data
	Alter Column user_id Type bigint;


-- Data value insertion section 

INSERT INTO user_data values 
(1, 'John Doe', 'john.doe@example.com', 'password123', '2025-08-01 10:15:00'),
(2, 'Jane Smith', 'jane.smith@example.com', 'qwerty456', '2025-08-02 12:30:00'),
(3, 'Alex Brown', 'alex.brown@example.com', 'abc123xyz', '2025-08-03 09:45:00'),
(4, 'Emily White', 'emily.white@example.com', 'pass789word', '2025-08-04 14:20:00'),
(5, 'Michael Green', 'michael.green@example.com', 'green2025', '2025-08-05 08:50:00');

-- Data value fetech and acces section 

select * from user_data;
