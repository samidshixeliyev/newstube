package az.dev.localtube.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity(name = "users")
@Table(schema = "dbo", name = "users")
public class User {

    @Id
    private Long id;
    private String name;
    private String surname;
    private String password;
    private String email;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role roles;

}