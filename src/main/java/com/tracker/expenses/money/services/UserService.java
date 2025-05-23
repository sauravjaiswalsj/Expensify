package com.tracker.expenses.money.services;

import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.dto.userdto.LoginDTO;
import com.tracker.expenses.money.dto.userdto.PasswordResetDTO;
import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.dto.userdto.VerifyUserDTO;
import com.tracker.expenses.money.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService {
    /****
 * Creates a new user based on the provided user data.
 *
 * @param userDTO the data transfer object containing user registration details
 * @return a response containing the response header and the created user entity
 */
Response<ResponseHeader, User> addUser(UserDTO userDTO);
    /**
 * Retrieves all users in the system.
 *
 * @return a list of all User entities
 */
List<User> findAll();
    /****
 * Retrieves a user entity by its username.
 *
 * @param username the username to search for
 * @return the User entity matching the provided username, or null if not found
 */
User findByUsername(String username);
    /**
 * Retrieves a user by their email address.
 *
 * @param email the email address to search for
 * @return the user associated with the specified email, or null if not found
 */
User findByEmail(String email);
    /**
 * Verifies a user's account using the provided verification details.
 *
 * @param verifyUserDTO the data required to verify the user
 * @return a response containing the operation status in the response header
 */
Response<ResponseHeader, Void> verifyUser(VerifyUserDTO verifyUserDTO);
    /****
 * Updates a user's password using the provided password reset data.
 *
 * @param passwordResetDTO the data required to reset the user's password
 * @return a response containing the response header and the updated user entity
 */
Response<ResponseHeader, User> updatePassword(PasswordResetDTO passwordResetDTO);
    /**
 * Updates the details of an existing user.
 *
 * @param user the user entity with updated information
 * @return a response containing the response header and the updated user entity
 */
Response<ResponseHeader, User> updateUser(User user);
    /**
 * Resends a verification code to the user identified by the given username.
 *
 * @param username the username of the user to whom the verification code will be sent
 * @return a response containing the operation status in the response header
 */
Response<ResponseHeader, Void> resendVerificationCode(String username);
    /**
 * Authenticates a user using the provided login credentials.
 *
 * @param loginDTO the login credentials for authentication
 * @return a UserDTO representing the authenticated user
 */
UserDTO authenticateUser(LoginDTO loginDTO);
    /**
 * Initiates the password recovery process for a user using the provided verification code.
 *
 * @param verificationCode the code used to verify the user's identity for password recovery
 * @return a response containing the operation status in the response header
 */
Response<ResponseHeader, Void> forgetUserPassword(String verificationCode);
    /****
 * Resets a user's forgotten password using the provided password reset details.
 *
 * @param passwordResetDTO the data transfer object containing password reset information
 * @return a response containing the operation status in the response header
 */
Response<ResponseHeader, Void> resetForgetPassword(PasswordResetDTO passwordResetDTO);
}
