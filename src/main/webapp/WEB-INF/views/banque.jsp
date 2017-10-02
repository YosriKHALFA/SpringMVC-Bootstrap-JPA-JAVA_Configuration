<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="f" uri="http://www.springframework.org/tags/form"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html >
<html>
<head>
<meta charset="UTF-8">
<title>banque</title>
<link href="<c:url value='/static/css/style1.css' />" rel="stylesheet"></link>
<link href="<c:url value='/static/css/bootstrap.css' />" rel="stylesheet"></link>
<script type="text/javascript"  src="<c:url value='/static/js/Masks.js' />" ></script>	
	
<script>

	function _GetObject(objStr) {
		var obj = null;
		try {
			obj = eval('document.forms[0].'+objStr);
		} catch(e) {}
		if (obj==null && objStr.indexOf('forms[')>=0) return eval(objStr);
		if (obj==null) obj = document.getElementById(objStr);
		alert(obj);
		return obj;
	}

	function verifNumber(obj){
		oNumberMask = new Mask("###########.##", "number");
		oNumberMask.attach(obj);
		oNumberMask.activeControleNombre();
		oNumberMask.activeControleNbNegatif();
	}
	
	function SetFocusSelect(p_obj){}
		
	function SetValue(obj,val){
		obj.value=val;
	}
			
	 
	

</script>

</head>
<body>
	<div class="bs-example">
		<div class="col-md-4">
			<div class="panel panel-info">
				<div class="panel-heading">Consultation d'un compte</div>
				<div class="panel-body">
					<f:form modelAttribute="banqueForm" method="post"
						action="chargerCompte">
						<div>
							<label>Code:</label>
							<f:input path="code" />
							<input class="btn btn-primary" type="submit" value="OK"/>
							<br>
							<c:if test="${not empty error }">
								<div class="text-danger">${error}</div>
							</c:if>
						</div>
					</f:form>
				</div>
			</div>
		</div>


		<c:if test="${not empty banqueForm.compte}">
			<div class="col-md-4">
				<div class="panel panel-info">
					<div class="panel-heading">Informations du compte</div>
					<div class="panel-body">
						<div>
							<label>Nom Client:</label><label>${banqueForm.compte.client.nomClient}</label>
						</div>
						<div>
							<label>Solde:</label><label>${banqueForm.compte.solde}</label>
						</div>
						<div>
							<label>Date Création:</label><label>${banqueForm.compte.dateCreation}</label>
						</div>
						<div>
							<label>Type de compte:</label><label>${banqueForm.typeCompte}</label>
						</div>
						<c:if test="${banqueForm.typeCompte=='CompteCourant' }">
							<div>
								<label>Découvert:</label><label>${banqueForm.compte.decouvert}</label>
							</div>
						</c:if>
						<c:if test="${banqueForm.typeCompte=='CompteEpargne' }">
							<div>
								<label>Taux:</label><label>${banqueForm.compte.taux}</label>
							</div>
						</c:if>
					</div>
				</div>
			</div>

			<div class="col-md-4">
				<div class="panel panel-info">
					<div class="panel-heading">Opérations sur le compte</div>
					<div class="panel-body">
						<f:form modelAttribute="banqueForm" action="saveOperation">
							<f:hidden path="code" />
							<div>
								<input type="radio" name="typeOperation" value="VER"
									checked="checked"
									onchange="document.getElementById('forVirement').style.display='none'" />
								<label>Versement</label> <input type="radio"
									name="typeOperation" value="RET"
									onchange="document.getElementById('forVirement').style.display='none'" />
								<label>Retrait</label> <input type="radio" name="typeOperation"
									value="VIR"
									onchange="document.getElementById('forVirement').style.display='block'" />
								<label>Virement</label>
							</div>

							<div id="forVirement" style="display: none">
								<label>Vers :</label>
								<f:input path="code2" />
							</div>
							<div>
								<label>Montant :</label>
								<f:input path="montant" onchange="verifNumber(this)"/>
							</div>
							<div class="row" style="padding:10px">
								<input class="btn btn-primary" type="submit" value="Save">
								<c:if test="${not empty banqueForm.exception }">
									<span class="text-danger">${banqueForm.exception}</span>
								</c:if>
							</div>


						</f:form>
					</div>
				</div>
			</div>
			<div class="col-md-12">
				<div class="panel panel-info">
					<div class="panel-heading">liste des opérations</div>
					<div class="panel-body">
						<table class="table table-striped">
							<tr>
								<th>Num</th>
								<th>Type</th>
								<th>date</th>
								<th>montant</th>
							</tr>
							<c:forEach items="${banqueForm.operations }" var="op">
								<tr>
									<td>${op.numeroOperation }</td>
									<td>${op}</td>
									<td>${op.dateOperation }</td>
									<td>${op.montant }</td>
								</tr>
							</c:forEach>
						</table>
						<div class="container">

							<ul class="nav nav-pills">
								<c:forEach begin="0" end="${banqueForm.nombrePages-1}" var="p">
									<li><a
										href="chargerCompte?page=${p}&code=${banqueForm.code}">${p }</a>
									</li>
								</c:forEach>
							</ul>

						</div>
					</div>


				</div>
			</div>
		</c:if>



	</div>
	<footer>
		<div class="navbar-fixed-bottom text-center">
			<div class="container-fluid  ">
				<p>© 2017 Yosri KHALFA</p>
			</div>
		</div>

	</footer>
	
</body>
</html>