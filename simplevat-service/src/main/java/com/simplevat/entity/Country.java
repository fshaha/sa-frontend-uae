package com.simplevat.entity;

import com.simplevat.entity.BankAccount;
import com.simplevat.entity.Company;
import com.simplevat.entity.Contact;
import lombok.Data;
import lombok.Setter;

import javax.persistence.*;
import java.util.Collection;

/**
 * Created by mohsinh on 2/26/2017.
 */

@NamedQueries({
        @NamedQuery(name="allCountries",
                query="SELECT c " +
                        "FROM Country c ")
})

@Entity
@Table(name = "COUNTRY")
@Data
public class Country {
    @Id
    @Column(name = "COUNTRY_CODE")
    private int countryCode;
    @Basic
    @Column(name = "COUNTRY_NAME")
    private String countryName;
    @Basic
    @Column(name = "COUNTRY_DESCRIPTION")
    private String countryDescription;
    @Basic
    @Column(name = "ISO_ALPHA3_CODE", length = 3, columnDefinition = "CHAR")
    private String isoAlpha3Code;

    @Transient
    @Setter
    private String countryFullName;

    public String getCountryFullName(){
        countryFullName = countryName+" - ("+isoAlpha3Code+")";
        return countryFullName;
    }

}
