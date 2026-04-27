package com.tracker.expenses.money.repository;

import com.tracker.expenses.money.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.stereotype.Repository;

@EnableMongoRepositories
@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByUsername(String username);
    User findByUsernameIgnoreCase(String username);
    User findByEmail(String email);
}
//MongoRepository<User, String> -> String is model -> @ID datatype.
