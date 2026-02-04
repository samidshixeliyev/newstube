package az.dev.localtube.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity(name = "permissions")
@Table(schema = "dbo", name = "permissions")
public class Authority {

    @Id
    private Long id;
    private String name;
    private String description;

}