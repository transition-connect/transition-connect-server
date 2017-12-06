MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;

//Create admins
create (:Admin {adminId: '1', email: 'roger.waldvogel@elyoos.org'});

//Create networking platforms
match (admin:Admin {adminId: '1'})
merge (np:NetworkingPlatform {platformId: '1', name: 'Elyoos', description: 'Elyoos ist eine Internetplattform, welche den Austausch von Informationen zur konstruktiven Gestaltung der Gesellschaft ermöglicht.',
link: 'https://www.elyoos.org'})
merge (np)<-[:IS_ADMIN]-(admin)
create (exportRules:ExportRules {manuallyAcceptOrganization: false})
merge (np)-[:EXPORT_RULES]->(exportRules)
create (exportConfig:ExportConfig {adapterType: 'standardNp', npApiUrl: 'https://preview.elyoos.org/tc', token: 'fiengib458ckeEr9dicv'})
merge (np)-[:EXPORT_CONFIG]->(exportConfig);

match (admin:Admin {adminId: '1'})
merge (np:NetworkingPlatform {platformId: '2', name: 'Transition Zürich', description:'Zürich ist bunt und lebendig! Es gibt Gemeinschaftsgärten, Repair-Cafés, alternative Wirtschaftsmodelle, Informationsveranstaltungen zum Thema Nachhaltigkeit und und und…
Transition Zürich will die Kraft dieser Organisationen und Initiativen bündeln', link: 'http://www.transition-zuerich.ch/'})
merge (np)<-[:IS_ADMIN]-(admin)
create (exportRules:ExportRules {manuallyAcceptOrganization: false})
merge (np)-[:EXPORT_RULES]->(exportRules);

//Create categories Elyoos
create (category:Category {categoryId: '1', idOnPlatform: 'health'})-[:DE]->(:CategoryTranslated {name: 'Gesundheit'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Health'});
create (category:Category {categoryId: '2', idOnPlatform: 'environmental'})-[:DE]->(:CategoryTranslated {name: 'Umwelt'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Environment'});
create (category:Category {categoryId: '3', idOnPlatform: 'spiritual'})-[:DE]->(:CategoryTranslated {name: 'Spiritualität'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Spirituality'});
create (category:Category {categoryId: '4', idOnPlatform: 'education'})-[:DE]->(:CategoryTranslated {name: 'Bildung'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Education'});
create (category:Category {categoryId: '5', idOnPlatform: 'personalDevelopment'})-[:DE]->(:CategoryTranslated {name: 'Persönliche Entwicklung'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Personal development'});
create (category:Category {categoryId: '6', idOnPlatform: 'politics'})-[:DE]->(:CategoryTranslated {name: 'Politik'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Politics'});
create (category:Category {categoryId: '7', idOnPlatform: 'economy'})-[:DE]->(:CategoryTranslated {name: 'Wirtschaft'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Economy'});
create (category:Category {categoryId: '8', idOnPlatform: 'socialDevelopment'})-[:DE]->(:CategoryTranslated {name: 'Gesellschaft'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Society'});

//Set used categories for networking platform Elyoos
match (np:NetworkingPlatform {platformId: '1'}), (category:Category)
where category.categoryId IN ['1', '2', '3', '4', '5', '6', '7', '8']
merge (np)-[:ORG_CATEGORY]->(category);

//Create categories Transition Zürich
create (category:Category {categoryId: '9'})-[:DE]->(:CategoryTranslated {name: 'Laden, Hofladen'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Shop'});
create (category:Category {categoryId: '10'})-[:DE]->(:CategoryTranslated {name: 'Cooperativen'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Cooperatives'});
create (category:Category {categoryId: '11'})-[:DE]->(:CategoryTranslated {name: 'Restaurant, Café, Bar'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Restaurant, Café, Bar'});
create (category:Category {categoryId: '12'})-[:DE]->(:CategoryTranslated {name: 'Markt'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Market'});
create (category:Category {categoryId: '13'})-[:DE]->(:CategoryTranslated {name: 'Garten'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Garden'});
create (category:Category {categoryId: '14'})-[:DE]->(:CategoryTranslated {name: 'Versand und Import'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Distribution and import'});
create (category:Category {categoryId: '20'})-[:DE]->(:CategoryTranslated {name: 'Wirtschaft und Politik'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Economy and politics'});

//Set used categories for networking platform Transition Zürich
match (np:NetworkingPlatform {platformId: '2'}), (category:Category)
  where category.categoryId IN ['9', '10', '11', '12', '13', '14', '20']
merge (np)-[:ORG_CATEGORY]->(category);