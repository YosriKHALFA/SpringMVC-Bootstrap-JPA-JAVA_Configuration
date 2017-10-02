package com.yosri.khalfa.metier;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yosri.khalfa.dao.IBanqueDao;
import com.yosri.khalfa.entities.Client;
import com.yosri.khalfa.entities.Compte;
import com.yosri.khalfa.entities.Employe;
import com.yosri.khalfa.entities.Groupe;
import com.yosri.khalfa.entities.Operation;
import com.yosri.khalfa.entities.Retrait;
import com.yosri.khalfa.entities.Versement;
@Transactional
@Service
public class BanqueMetierImpl implements IBanqueMetier {
	@Autowired
	private IBanqueDao dao;
	
	
	public void setDao(IBanqueDao dao) {
		this.dao = dao;
	}
    
	@Override
	public Client addClient(Client c) {
		return dao.addClient(c);
	}

	@Override
	public Employe addEmploye(Employe e, Long codeSup) {
		// TODO Auto-generated method stub
		return dao.addEmploye(e, codeSup);
	}

	@Override
	public Groupe addGroupe(Groupe g) {
		// TODO Auto-generated method stub
		return dao.addGroupe(g);
	}

	@Override
	public void addEmployeToGroupe(Long codeEmp, Long codeGr) {
		dao.addEmployeToGroupe(codeEmp, codeGr);
		
	}

	@Override
	public Compte addCompte(Compte cp, Long codeCli, Long codeEmp) {
		return dao.addCompte(cp, codeCli, codeEmp);
	}

	@Override
	public void verser(double mt, String cpte, Long codeEmp) {
		dao.addOperation(new Versement(new Date(),mt), cpte, codeEmp);
		Compte cp=dao.consulterCompte(cpte);
		cp.setSolde(cp.getSolde()+mt);
	}

	@Override
	public void retirer(double mt, String cpte, Long codeEmp) {
		
		Compte cp=dao.consulterCompte(cpte);
		if(cp.getSolde()<mt)
			throw new RuntimeException("Solde Insuffisant !");
		cp.setSolde(cp.getSolde()-mt);
		dao.addOperation(new Retrait(new Date(),mt), cpte, codeEmp);
	}

	@Override
	public void virement(double mt, String cpte1, String cpte2, Long codeEmp) {
		 if(cpte1.equals(cpte2)) throw new RuntimeException("Operation Invalide !");
		 verser(mt, cpte2, codeEmp);
		 retirer(mt, cpte1, codeEmp);	
		
	}

	@Override
	public Compte consulterCompte(String codeCpte) {
		// TODO Auto-generated method stub
		return dao.consulterCompte(codeCpte);
	}

	@Override
	public List<Operation> consulterOperations(String codeCpte,int position,int nbOperation) {
		// TODO Auto-generated method stub
		return dao.consulterOperations(codeCpte,position,nbOperation);
	}

	@Override
	public Client consulterClient(Long codeCli) {
		// TODO Auto-generated method stub
		return dao.consulterClient(codeCli);
	}

	@Override
	public List<Client> consulterClients(String mc) {
		// TODO Auto-generated method stub
		return dao.consulterClients(mc);
	}

	@Override
	public List<Compte> getComptesByClient(Long codeCli) {
		// TODO Auto-generated method stub
		return dao.getComptesByClient(codeCli);
	}

	@Override
	public List<Compte> getComptesByEmploye(Long codeEmp) {
		// TODO Auto-generated method stub
		return dao.getComptesByEmploye(codeEmp);
	}

	@Override
	public List<Employe> getEmployes() {
		// TODO Auto-generated method stub
		return dao.getEmployes();
	}

	@Override
	public List<Groupe> getGroupes() {
		// TODO Auto-generated method stub
		return dao.getGroupes();
	}

	@Override
	public List<Employe> getEmployesByGroupe(Long codeGr) {
		// TODO Auto-generated method stub
		return dao.getEmployesByGroupe(codeGr);
	}

	@Override
	public long getNombteOperation(String numCpte) {
		// TODO Auto-generated method stub
		return dao.getNombteOperation(numCpte);
	}

}
