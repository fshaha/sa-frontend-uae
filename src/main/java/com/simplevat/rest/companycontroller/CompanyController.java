package com.simplevat.rest.companycontroller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.simplevat.bank.model.DeleteModel;
import com.simplevat.constant.dbfilter.CompanyFilterEnum;
import com.simplevat.entity.Company;
import com.simplevat.security.JwtTokenUtil;
import com.simplevat.service.CompanyService;

import io.swagger.annotations.ApiOperation;

@Component
@RequestMapping("/rest/company")
public class CompanyController {

	@Autowired
	private CompanyService companyService;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@Autowired
	private CompanyRestHelper companyRestHelper;

	@ApiOperation(value = "Get Company List")
	@GetMapping(value = "/getList")
	public ResponseEntity getCompanyList(HttpServletRequest request) {
		try {
			Map<CompanyFilterEnum, Object> filterMap = new HashMap<CompanyFilterEnum, Object>();
			filterMap.put(CompanyFilterEnum.DELETE_FLAG, false);
			List<Company> companyList = companyService.getCompanyList(filterMap);
			if (companyList == null) {
				return new ResponseEntity<>(HttpStatus.NOT_FOUND);
			}
			return new ResponseEntity<>(companyRestHelper.getModelList(companyList), HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@ApiOperation(value = "delete By Id")
	@DeleteMapping(value = "/delete")
	public ResponseEntity deleteProduct(@RequestParam(value = "id") Integer id) {
		try {
			Company company = companyService.findByPK(id);
			if (company != null) {
				company.setDeleteFlag(Boolean.TRUE);
				companyService.update(company);
			}
			return new ResponseEntity(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@ApiOperation(value = "Delete Product in Bulk")
	@DeleteMapping(value = "/deletes")
	public ResponseEntity deleteProducts(@RequestBody DeleteModel ids) {
		try {
			companyService.deleteByIds(ids.getIds());
			return new ResponseEntity(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);

	}

	@ApiOperation(value = "Get Company By ID")
	@GetMapping(value = "/getById")
	public ResponseEntity getProductById(@RequestParam(value = "id") Integer id) {
		try {
			Company company = companyService.findByPK(id);

			if (company == null) {
				return new ResponseEntity(HttpStatus.NOT_FOUND);
			} else {
				return new ResponseEntity<>(companyRestHelper.getModel(company), HttpStatus.OK);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@ApiOperation(value = "Add New Company")
	@PostMapping(value = "/save")
	public ResponseEntity save(@ModelAttribute CompanyModel companyModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Company company = companyRestHelper.getEntity(companyModel);
			company.setCreatedBy(userId);
			company.setCreatedDate(LocalDateTime.now());
			company.setDeleteFlag(Boolean.FALSE);
			companyService.persist(company);
			return new ResponseEntity(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@ApiOperation(value = "Update Company")
	@PostMapping(value = "/update")
	public ResponseEntity update(@ModelAttribute CompanyModel companyModel, HttpServletRequest request) {
		try {
			Integer userId = jwtTokenUtil.getUserIdFromHttpRequest(request);
			Company company = companyRestHelper.getEntity(companyModel);
			company.setLastUpdateDate(LocalDateTime.now());
			company.setLastUpdatedBy(userId);
			companyService.update(company);
			return new ResponseEntity(HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

}
