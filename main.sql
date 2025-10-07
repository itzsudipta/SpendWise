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

INSERT INTO  category values 
(1, 1, 'Groceries'),
(2, 2, 'Transport'),
(3, 1, 'Entertainment'),
(4, 3, 'Health'),
(5, 4, 'Bills'),
(6, 5, 'Shopping'),
(7, 2, 'Travel'),
(8, 3, 'Education'),
(9, 4, 'Utilities'),
(10, 5, 'Dining');

INSERT INTO  expense values 
(1, 1, 1, 50.75, 'Weekly grocery shopping', '2025-08-01', '2025-08-01 10:15:00'),
(2, 2, 2, 15.00, 'Bus fare', '2025-08-02', '2025-08-02 12:30:00'),
(3, 1, 3, 30.00, 'Movie tickets', '2025-08-03', '2025-08-03 09:45:00'),
(4, 3, 4, 100.00, 'Doctor visit', '2025-08-04', '2025-08-04 14:20:00'),
(5, 4, 5, 200.00, 'Electricity bill', '2025-08-05', '2025-08-05 08:50:00'),
(6, 5, 6, 75.50, 'New shoes', '2025-08-06', '2025-08-06 11:10:00'),
(7, 2, 7, 300.00, 'Weekend trip', '2025-08-07', '2025-08-07 13:25:00'),
(8, 3, 8, 120.00, 'Online course fee', '2025-08-08', '2025-08-08 15:40:00'),
(9, 4, 9, 60.00, 'Water bill', '2025-08-09', '2025-08-09 09:55:00'),
(10, 5, 10, 45.00, 'Dinner at restaurant', '2025-08-10', '2025-08-10 19:30:00');

INSERT INTO  Budget values 
(1, 1, '2025-08-01', 500.00, '2025-08-01 10:15:00'),
(2, 2, '2025-08-01', 300.00, '2025-08-02 12:30:00'),
(3, 3, '2025-08-01', 400.00, '2025-08-03 09:45:00'),
(4, 4, '2025-08-01', 600.00, '2025-08-04 14:20:00'),
(5, 5, '2025-08-01', 350.00, '2025-08-05 08:50:00');

-- Data value fetech and acces section 

select * from user_data;
select  * from  category;
select * from expense;
