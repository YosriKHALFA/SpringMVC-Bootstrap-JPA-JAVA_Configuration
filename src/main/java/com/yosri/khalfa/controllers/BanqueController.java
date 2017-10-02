package com.yosri.khalfa.controllers;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.yosri.khalfa.entities.Compte;
import com.yosri.khalfa.entities.Operation;
import com.yosri.khalfa.metier.IBanqueMetier;
import com.yosri.khalfa.models.BanqueForm;

@Controller
public class BanqueController {

	@Autowired
	private IBanqueMetier metier;

	@Autowired
	MessageSource messageSource;

	/**
	 * This method will list all existing users.
	 */
	@RequestMapping(value = { "/", "/list" }, method = RequestMethod.GET)

	public String index(Model model){
		model.addAttribute("banqueForm", new BanqueForm());
		return "banque";
	}

	@RequestMapping(value="/chargerCompte")
	public String charger(@Valid BanqueForm bf, 
			BindingResult bindingResult,Model model){
		if(bindingResult.hasErrors()){
			return "banque";
		}
		try {
			chargerCompte(bf);	
		}catch (Exception e) {
			model.addAttribute("error", e.getMessage());
		}

		model.addAttribute("banqueForm", bf);
		return "banque";
	}

	@RequestMapping(value="/saveOperation", method = RequestMethod.POST)
	public String saveOp(@Valid BanqueForm bf,BindingResult bindingResult){
		try {
			if(bindingResult.hasErrors()){
				return "banque";
			}

			if(bf.getTypeOperation().equals("VER")){
				metier.verser(bf.getMontant(), bf.getCode(), 1L);
			}
			else if(bf.getTypeOperation().equals("RET")){
				metier.retirer(bf.getMontant(), bf.getCode(), 1L);
			}
			else if(bf.getTypeOperation().equals("VIR")){
				metier.virement(bf.getMontant(), bf.getCode(), bf.getCode2(), 1L);
			}

		} catch (Exception e) {
			bf.setException(e.getMessage());
		}
		chargerCompte(bf);

		return "banque";
	}

	public void chargerCompte(BanqueForm bf){

		Compte cp=metier.consulterCompte(bf.getCode());
		bf.setTypeCompte(cp.getClass().getSimpleName());
		bf.setCompte(cp);
		int pos=bf.getNbLignes()*bf.getPage();
		List<Operation> ops=metier.consulterOperations(bf.getCode(),pos,bf.getNbLignes());
		bf.setOperations(ops);
		long nbOp=metier.getNombteOperation(bf.getCode());
		bf.setNombrePages((int)(nbOp/bf.getNbLignes())+1);

	}


}
