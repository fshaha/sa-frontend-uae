/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.web.company.controller;

import com.github.javaplugs.jsf.SpringScopeView;
import com.simplevat.entity.Company;
import com.simplevat.entity.CompanyType;
import com.simplevat.entity.Country;
import com.simplevat.service.CompanyService;
import com.simplevat.service.CompanyTypeService;
import com.simplevat.service.CountryService;
import com.simplevat.web.user.controller.UserProfileController;
import com.simplevat.web.utils.FacesUtil;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import javax.annotation.PostConstruct;
import javax.faces.application.FacesMessage;
import javax.faces.context.FacesContext;
import javax.faces.model.SelectItem;
import lombok.Getter;
import lombok.Setter;
import org.primefaces.event.FileUploadEvent;
import org.primefaces.model.StreamedContent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

/**
 *
 * @author admin
 */
@Controller
@SpringScopeView
public class CompanyProfileController extends CompanyHelper implements Serializable {

    private final static Logger LOGGER = LoggerFactory.getLogger(CompanyProfileController.class);
    @Autowired
    private CompanyService companyService;
    @Autowired
    private CompanyTypeService companyTypeService;
    @Autowired
    private CountryService countryService;
    @Getter
    @Setter
    public CompanyModel companyModel;
    @Getter
    @Setter
    public boolean copyInvoiceAddress;
    public StreamedContent profilePic;
    @Getter
    private List<Country> countries = new ArrayList<>();
    @Getter
    private List<SelectItem> companyTypes = new ArrayList<>();
    @Getter
    @Setter
    public Company company;
    @Getter
    @Setter        
    String fileName;
    @Getter 
    private boolean renderProfilePic;

    @PostConstruct
    public void init() {
        companyModel = getCompanyModelFromCompany(companyService.findByPK(FacesUtil.getLoggedInUser().getCompany().getCompanyId()));
        countries = countryService.getCountries();
        companyTypes = getCompanyTypeSelectItem();
        FacesContext.getCurrentInstance().getExternalContext().getSessionMap().put("STREAMED_CONTENT_COMPANY_LOGO", companyModel.getCompanyLogo());
        renderProfilePic = true;
    }

    private List<SelectItem> getCompanyTypeSelectItem() {
        List<CompanyType> companyTypeList = companyTypeService.getCompanyTypes();
        List<SelectItem> tmpList = new ArrayList<>();
        companyTypeList.forEach((companyType) -> {
            tmpList.add(new SelectItem(companyType.getId(), companyType.getCompanyTypeName()));
        });
        return tmpList;
    }

    public List<Country> completeCountry(String countryStr) {
        List<Country> countrySuggestion = new ArrayList<>();

        Iterator<Country> countryIterator = this.countries.iterator();

        LOGGER.debug(" Size :" + countries.size());

        while (countryIterator.hasNext()) {
            Country country = countryIterator.next();
            if (country.getCountryName() != null
                    && !country.getCountryName().isEmpty()
                    && country.getCountryName().toUpperCase().contains(countryStr.toUpperCase())) {
                countrySuggestion.add(country);
            } else if (country.getIsoAlpha3Code() != null
                    && !country.getIsoAlpha3Code().isEmpty()
                    && country.getIsoAlpha3Code().toUpperCase().contains(countryStr.toUpperCase())) {
                countrySuggestion.add(country);
            }
        }

        LOGGER.debug(" Size :" + countrySuggestion.size());

        return countrySuggestion;
    }

    public void saveUpdate() {
        try {

           
            Company c = getCompanyFromCompanyModel(companyModel);
            c.setCompanyTypeCode(companyTypeService.findByPK(c.getCompanyTypeCode().getId()));
            if (c.getCompanyId() != null && c.getCompanyId() > 0) {
                companyService.update(c);
            }
            init();
            FacesContext.getCurrentInstance().addMessage(null, new FacesMessage("Company Profile updated successfully"));
        } catch (IllegalArgumentException ex) {
            java.util.logging.Logger.getLogger(UserProfileController.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

    public void sameAsInvoicingAddress() {
        if (copyInvoiceAddress) {
            companyModel.setCompanyAddressLine1(companyModel.getInvoicingAddressLine1());
            companyModel.setCompanyAddressLine2(companyModel.getInvoicingAddressLine2());
            companyModel.setCompanyAddressLine3(companyModel.getInvoicingAddressLine3());
            companyModel.setCompanyCity(companyModel.getInvoicingCity());
            companyModel.setCompanyCountryCode(companyModel.getInvoicingCountryCode());
            companyModel.setCompanyPoBoxNumber(companyModel.getInvoicingPoBoxNumber());
            companyModel.setCompanyPostZipCode(companyModel.getInvoicingPostZipCode());
            companyModel.setCompanyStateRegion(companyModel.getInvoicingStateRegion());
        } else {
            companyModel.setCompanyAddressLine1("");
            companyModel.setCompanyAddressLine2("");
            companyModel.setCompanyAddressLine3("");
            companyModel.setCompanyCity("");
            companyModel.setCompanyCountryCode(countryService.getDefaultCountry());
            companyModel.setCompanyPoBoxNumber("");
            companyModel.setCompanyPostZipCode("");
            companyModel.setCompanyStateRegion("");
        }
    }
    
    public void handleFileUpload(FileUploadEvent event) {
       companyModel.setCompanyLogo(event.getFile().getContents());
       fileName = event.getFile().getFileName();
       FacesContext.getCurrentInstance().getExternalContext().getSessionMap().put("STREAMED_CONTENT_COMPANY_LOGO", event.getFile().getContents());
       renderProfilePic = true;
       FacesMessage message = new FacesMessage("Succesful", event.getFile().getFileName() + " is uploaded.");
       FacesContext.getCurrentInstance().addMessage(null, message);
    }
}
