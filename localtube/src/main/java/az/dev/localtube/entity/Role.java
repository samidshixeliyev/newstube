package az.dev.localtube.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Table(schema = "dbo", name = "roles")
@Entity(name = "roles")
public class Role {

    @Id
    private Long id;
    private String name;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "role_permission",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private List<Authority> authorities;

}