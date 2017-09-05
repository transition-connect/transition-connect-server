MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;

//Create admins
create (:Admin {adminId: '1', email: 'test@localhost.localdomain'});
create (:Admin {adminId: '2', email: 'test2@localhost.localdomain'});
create (:Admin {adminId: '3', email: 'test3@localhost.localdomain'});
create (:Admin {adminId: '4', email: 'test4@localhost.localdomain'});
create (:Admin {adminId: '5', email: 'test5@localhost.localdomain'});

//Create networking platforms
match (admin:Admin {adminId: '2'})
merge (:NetworkingPlatform {platformId: '1', name: 'Elyoos', description: 'Elyoos ist eine Internetplattform, welche den Austausch von Informationen zur konstruktiven Gestaltung der Gesellschaft ermöglicht.',
link: 'https://www.elyoos.org'})<-[:IS_ADMIN]-(admin);
match (admin:Admin {adminId: '3'})
merge (:NetworkingPlatform {platformId: '2', name: 'Transition Zürich', description:'Zürich ist bunt und lebendig! Es gibt Gemeinschaftsgärten, Repair-Cafés, alternative Wirtschaftsmodelle, Informationsveranstaltungen zum Thema Nachhaltigkeit und und und…
Transition Zürich will die Kraft dieser Organisationen und Initiativen bündeln', link: 'http://www.transition-zuerich.ch/'})<-[:IS_ADMIN]-(admin);
match (admin:Admin {adminId: '4'})
merge (:NetworkingPlatform {platformId: '3', name: 'Gemeinsam Jetzt', description: 'gemeinsam.jetzt ist eine Plattform die mit verschiedenen Angeboten zivilgesellschaftliche Initiativen & Akteur*innen verschiedener Themenbereiche (Ernährung - Gesellschaft - Kultur - Ökologie - Politik - Wirtschaft) unterstützt. Das gemeinsame Ziel ist ein gesellschaftlicher Wandel, unter dem Leitrahmen eines minimalen Wertekonsens: Achtsamkeit - Menschenwürde - Partizipation - Solidarität - Zukunftsfähigkeit ',
                            link: 'https://steiermark.gemeinsam.jetzt/'})<-[:IS_ADMIN]-(admin);

//Create categories Elyoos
create (category:Category {categoryId: '1'})-[:DE]->(:CategoryTranslated {name: 'Gesundheit'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Health'});
create (category:Category {categoryId: '2'})-[:DE]->(:CategoryTranslated {name: 'Umwelt'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'environment'});
create (category:Category {categoryId: '3'})-[:DE]->(:CategoryTranslated {name: 'Spiritualität'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'spirituality'});
create (category:Category {categoryId: '4'})-[:DE]->(:CategoryTranslated {name: 'Bildung'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'education'});
create (category:Category {categoryId: '5'})-[:DE]->(:CategoryTranslated {name: 'Persönliche Entwicklung'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Personal development'});
create (category:Category {categoryId: '6'})-[:DE]->(:CategoryTranslated {name: 'Politik'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Politics'});
create (category:Category {categoryId: '7'})-[:DE]->(:CategoryTranslated {name: 'Wirtschaft'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Economy'});
create (category:Category {categoryId: '8'})-[:DE]->(:CategoryTranslated {name: 'Gesellschaft'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Society'});

//Set used categories for networking platform Elyoos
match (np:NetworkingPlatform {platformId: '1'}), (category:Category)
where category.categoryId IN ['1', '2', '3', '4', '5', '6', '7', '8']
merge (np)-[:CATEGORY]->(:SimilarCategoryMapper)-[:USED_CATEGORY]->(category);

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

//Set used categories for networking platform Transition Zürich
match (np:NetworkingPlatform {platformId: '2'}), (category:Category)
where category.categoryId IN ['9', '10', '11', '12', '13', '14']
merge (np)-[:CATEGORY]->(:SimilarCategoryMapper)-[:USED_CATEGORY]->(category);

//Create categories Gemeinsam Jetzt
create (category:Category {categoryId: '15'})-[:DE]->(:CategoryTranslated {name: 'Bauen'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'To build'});
create (category:Category {categoryId: '16'})-[:DE]->(:CategoryTranslated {name: 'Energie'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Energy'});
create (category:Category {categoryId: '17'})-[:DE]->(:CategoryTranslated {name: 'Klima'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Climate'});
create (category:Category {categoryId: '18'})-[:DE]->(:CategoryTranslated {name: 'Landwirtschaft'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Agriculture'});
create (category:Category {categoryId: '19'})-[:DE]->(:CategoryTranslated {name: 'Natur'})
merge (category)-[:EN]->(:CategoryTranslated {name: 'Nature'});

//Set used categories for networking platform Gemeinsam Jetzt
match (np:NetworkingPlatform {platformId: '3'}), (category:Category)
where category.categoryId IN ['15', '16', '17', '18', '19']
merge (np)-[:CATEGORY]->(:SimilarCategoryMapper)-[:USED_CATEGORY]->(category);

//Create organizations
match (admin:Admin {adminId: '1'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '1', name: 'sinndrin genossenschaft',
description: 'Unsere Vision ist es sinnstiftende Projekte umzusetzen, die der Gesellschaft von Nutzen sind. Dabei sind wir offen für alle Projekte die unseren Grundsätzen folgen. Die stetige Weiterentwicklung der Genossenschaft und ihrer Mitarbeitenden ist uns wichtig, weshalb wir auch an der Bearbeitung neuer Themenbereiche interessiert sind.',
slogan: 'Die sinndrin genossenschaft ist ein auf Nachhaltigkeit ausgerichtetes Team von Ingenieuren.', website: 'https://www.sinndrin.ch/', created: 1504580000, modified: 1504593377});
match (org:Organization {organizationId: '1'}), (np:NetworkingPlatform {platformId: '1'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '1'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '2', name: 'Slow Food Youth',
description: 'Wir sind eine Gemeinschaft von jungen Produzenten, Köchen, Hobbygärtnern, Studenten, Landwirten, Feinschmeckern, Aktivisten und vielen mehr. Wir sind junge Menschen, denen es nicht egal ist, woher das Essen auf dem Teller kommt, und für die essen mehr als nur Energiezufuhr bedeutet. Mit viel Kreativität und unserem breiten Wissen setzen wir uns für eine bessere Lebensmittelzukunft ein.',
slogan: 'Wir haben keinen', website: 'http://www.slowfoodyouth.ch/', created: 1504590000, modified: 1504594377});
match (org:Organization {organizationId: '2'}), (np:NetworkingPlatform {platformId: '1'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '1'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '3', name: 'adsfa asdfa asdfsdasdf asdfasdfa asdfasdf jölene asdf jöqlwe qwelknqwe nqwelj nqwelröj nqweölj nqweklrjöl'});
match (org:Organization {organizationId: '3'}), (np:NetworkingPlatform {platformId: '1'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '4', name: 'Bio für Jede'});
match (org:Organization {organizationId: '4'}), (np:NetworkingPlatform {platformId: '2'})
merge (np)-[:CREATED]->(org);