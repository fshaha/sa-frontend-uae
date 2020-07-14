/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.utils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 *
 * @author admin
 */

@Component
public class DateFormatUtil {
	private final Logger LOGGER = LoggerFactory.getLogger(DateFormatUtil.class);

	public static List<String> dateFormatList() {
		List<String> dateFormats = new ArrayList<>();
		dateFormats.add("dd/MM/yyyy");
		dateFormats.add("yyyy/MM/dd");
		dateFormats.add("dd-MM-yyyy");
		dateFormats.add("dd-M-yyyy");
		dateFormats.add("MM-dd-yyyy");
		dateFormats.add("yyyy-MM-dd");
		dateFormats.add("dd MMMM yyyy");
		dateFormats.add("MM/dd/yyyy");
		return dateFormats;
	}

	public String getLocalDateTimeAsString(LocalDateTime localDateTimeDate, String format) {
		Date date = Date.from(localDateTimeDate.atZone(ZoneId.systemDefault()).toInstant());
		SimpleDateFormat dateFormatter = new SimpleDateFormat(format);
		return dateFormatter.format(date);

	}

	public LocalDateTime getDateStrAsLocalDateTime(String strDate, String format) {
		SimpleDateFormat dateFormatter = new SimpleDateFormat(format);
		Date d;
		try {
			d = dateFormatter.parse(strDate);
		} catch (ParseException e) {
			d = new Date();
			LOGGER.error("Error", e);
		}
		LocalDateTime dob = Instant.ofEpochMilli(d.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime();
		return dob;

	}

	public Date getDateStrAsDate(String strDate, String format) {
		SimpleDateFormat dateFormatter = new SimpleDateFormat(format);
		Date d;
		try {
			d = dateFormatter.parse(strDate);
		} catch (ParseException e) {
			d = new Date();
			LOGGER.error("Error", e);
		}
		return d;
	}

	public String getDateAsString(Date date, String format) {
		SimpleDateFormat dateFormatter = new SimpleDateFormat(format);
		return dateFormatter.format(date);
	}
	public String getDateAsString(){
		Date date = Calendar.getInstance().getTime();
		DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		return dateFormat.format(date);

	}

	public Date getDate(){
		Date date = Calendar.getInstance().getTime();
		DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		try {
			return dateFormat.parse(dateFormat.format(date));
		} catch (ParseException e) {
			return  Calendar.getInstance().getTime();
		}

	}
}
