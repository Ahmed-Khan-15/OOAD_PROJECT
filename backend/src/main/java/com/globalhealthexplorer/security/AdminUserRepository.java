package com.globalhealthexplorer.security;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

	@Query("select adminUser from AdminUser adminUser where lower(adminUser.email) = lower(:email)")
	Optional<AdminUser> findByEmailIgnoreCase(@Param("email") String email);

	@Modifying
	@Query("""
			update AdminUser adminUser
			set adminUser.lastLoginAt = CURRENT_TIMESTAMP
			where adminUser.id = :id
			""")
	int updateLastLogin(@Param("id") Long id);
}
