MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r;

//Create admins
create (:Admin {adminId: '1', email: 'test@localhost.localdomain'});
create (:Admin {adminId: '2', email: 'test2@localhost.localdomain'});
create (:Admin {adminId: '3', email: 'test3@localhost.localdomain'});
create (:Admin {adminId: '4', email: 'test4@localhost.localdomain'});
create (:Admin {adminId: '5', email: 'test5@localhost.localdomain'});

//Create networking platforms
match (admin:Admin {adminId: '2'})
merge (np:NetworkingPlatform {platformId: '1', name: 'Elyoos', description: 'Elyoos ist eine Internetplattform, welche den Austausch von Informationen zur konstruktiven Gestaltung der Gesellschaft ermöglicht.',
link: 'https://www.elyoos.org'})
merge (np)<-[:IS_ADMIN]-(admin)
create (exportRules:ExportRules {manuallyAcceptOrganization: false})
merge (np)-[:EXPORT_RULES]->(exportRules);
match (admin:Admin {adminId: '3'})
merge (np:NetworkingPlatform {platformId: '2', name: 'Transition Zürich', description:'Zürich ist bunt und lebendig! Es gibt Gemeinschaftsgärten, Repair-Cafés, alternative Wirtschaftsmodelle, Informationsveranstaltungen zum Thema Nachhaltigkeit und und und…
Transition Zürich will die Kraft dieser Organisationen und Initiativen bündeln', link: 'http://www.transition-zuerich.ch/'})
merge (np)<-[:IS_ADMIN]-(admin)
create (exportRules:ExportRules {manuallyAcceptOrganization: false})
merge (np)-[:EXPORT_RULES]->(exportRules);
match (admin:Admin {adminId: '4'})
merge (np:NetworkingPlatform {platformId: '3', name: 'Gemeinsam Jetzt', description: 'gemeinsam.jetzt ist eine Plattform die mit verschiedenen Angeboten zivilgesellschaftliche Initiativen & Akteur*innen verschiedener Themenbereiche (Ernährung - Gesellschaft - Kultur - Ökologie - Politik - Wirtschaft) unterstützt. Das gemeinsame Ziel ist ein gesellschaftlicher Wandel, unter dem Leitrahmen eines minimalen Wertekonsens: Achtsamkeit - Menschenwürde - Partizipation - Solidarität - Zukunftsfähigkeit ',
                            link: 'https://steiermark.gemeinsam.jetzt/'})
merge (np)<-[:IS_ADMIN]-(admin)
create (exportRules:ExportRules {manuallyAcceptOrganization: true})
merge (np)-[:EXPORT_RULES]->(exportRules);

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

//Create organizations for Elyoos
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

//Assign for Elyoos categories to organizations
match (org:Organization {organizationId: '1'}), (np:NetworkingPlatform {platformId: '1'})
merge (org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)
with assigner
match (category:Category)
  where category.categoryId IN ['7', '8']
merge (assigner)-[:ASSIGNED]->(category);

match (org:Organization {organizationId: '2'}), (np:NetworkingPlatform {platformId: '1'})
merge (org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)
with assigner
match (category:Category)
  where category.categoryId IN ['1', '2']
merge (assigner)-[:ASSIGNED]->(category);

match (org:Organization {organizationId: '3'}), (np:NetworkingPlatform {platformId: '1'})
merge (org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)
with assigner
match (category:Category)
  where category.categoryId IN ['4', '5', '6']
merge (assigner)-[:ASSIGNED]->(category);

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
merge (np)-[:CATEGORY]->(:SimilarCategoryMapper)-[:USED_CATEGORY]->(category);

//Create organizations for Transition Zürich
match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '4', name: 'Bio für Jede', slogan: '',
description: 'Wir arbeiten mit den Lebensmittel, welche bereits vorhanden sind, mit dem Wissen, welches gegenwärtig ist. Wir möchten, dass es jedem möglich ist, sich von biologischen Lebensmitteln zu ernähren. Wir wollen gegen die Wegwerf-Gesellschaft angehen und unabhängig vorhandenes Wissen weitergeben. Wir wollen weiter kommen an den Punkt, an dem wir jetzt stehen.',
website: 'https://biofürjede.ch/', created: 1504500000, modified: 1504504377});
match (org:Organization {organizationId: '4'}), (np:NetworkingPlatform {platformId: '2'})
merge (np)-[:CREATED]->(org);

//Assign for Tranisition Zürich categories to organizations
match (org:Organization {organizationId: '4'}), (np:NetworkingPlatform {platformId: '2'})
merge (org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)
with assigner
match (category:Category)
  where category.categoryId IN ['9', '10']
merge (assigner)-[:ASSIGNED]->(category);

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

//Create organizations for Gemeinsam Jetzt
match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '5', name: 'GrazWiki', slogan: '',
description: 'Das Projekt soll Bewusstsein für die Umgebung schaffen und deren bauliche Veränderungen sichtbar machen. Mit Informationen über die Häuser und deren Geschichte sollen städtebauliche Entwicklungen transparenter erfasst werden. Der Dialog um die Thematik wird gefördert und Menschen können mit offenen Augen ihre Stadt neu entdecken.',
website: 'http://www.grazwiki.at', created: 1504570000, modified: 1504504377});
match (org:Organization {organizationId: '5'}), (np:NetworkingPlatform {platformId: '3'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '6', name: 'Ingenieure ohne Grenzen Austria', slogan: '',
description: 'Ingenieure ohne Grenzen Austria will durch die Umsetzung von ingenieurtechnischen Projekten die Lebenssituation von Menschen in Entwicklungsländern nachhaltig verbessern und so einen kleinen Beitrag für eine bessere Welt leisten. Dabei stellt die Zusammenarbeit mit der lokalen Bevölkerung auf sozialer und entwicklungspolitischer Ebene ein zentrales Element unserer Tätigkeit dar. Somit wird sowohl eine auf die NutzerInnen abgestimmte Lösung als auch die Wertschöpfung für die Menschen vor Ort gewährleistet. Neben der Ausarbeitung und Umsetzung von technisch einfachen aber robusten Lösungen für die primären Notwendigkeiten, wie die Versorgung mit Trinkwasser und Elektrizität sowie die Errichtung von Sanitäranlagen, die einem jedem Menschen, egal welcher ethnischer Zugehörigkeit, ob reich oder arm, zur Verfügung stehen sollte, versuchen wir auch technisches Wissen an die Menschen in den Entwicklungsländern weiterzuvermitteln.',
website: 'http://www.iog-austria.at', created: 1504560000, modified: 1504504377});
match (org:Organization {organizationId: '6'}), (np:NetworkingPlatform {platformId: '3'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '7', name: 'Leben in Gemeinschaft', slogan: '',
description: 'Unser Ziel ist es, im ländlichen Bereich einen Wohn-, Arbeits- und Lebensraum für etwa 100 Menschen zu schaffen, in dem alle Altersgruppen und unterschiedliche Berufe, Interessen und Fertigkeiten vertreten sind. Hier werden verschiedene handwerkliche, landwirtschaftliche, soziale, pädagogische und künstlerische Tätigkeiten ausgeübt. Dabei wird einerseits traditionelles Wissen erhalten und weitergegeben, anderseits kommen sinnvolle, nachhaltige und zukunftsweisende Technologien zum Einsatz und werden weiter entwickelt. Der Verein Leben in Gemeinschaft (LiG) wurde mit dem Ziel gegründet, ein naturnahes, generationsübergreifendes Dorf aufzubauen, das es in dieser Form und Größe in Österreich noch nicht gibt. Damit wollen wir Menschen ansprechen, mit uns ressourcenschonend und selbstbestimmt zu leben, nachhaltig zu wirtschaften und Achtsamkeit für Beziehungen zu entwickeln. Wir stellen die Sinnhaftigkeit von steigendem Konsum und permanentem Wirtschaftswachstum infrage.',
website: 'http://www.lebeningemeinschaft.at', created: 1502500000, modified: 1504504377});
match (org:Organization {organizationId: '7'}), (np:NetworkingPlatform {platformId: '3'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '8', name: 'Einsparkraftwerk', slogan: '',
description: 'Wir wollen erreichen, dass das Bewusstsein um unsere beschränkten Ressourcen steigt, und dass die Menschen verstehen, dass ressourcenschonendes Handeln für viele von uns ein zusätzliches Einkommen sein kann.',
website: 'http://www.einsparkraftwerk.at', created: 1504000000, modified: 1504504377});
match (org:Organization {organizationId: '8'}), (np:NetworkingPlatform {platformId: '3'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '9', name: 'Ingenieure ohne Grenzen Austria', slogan: '',
description: 'Ingenieure ohne Grenzen Austria will durch die Umsetzung von ingenieurtechnischen Projekten die Lebenssituation von Menschen in Entwicklungsländern nachhaltig verbessern und so einen kleinen Beitrag für eine bessere Welt leisten. Dabei stellt die Zusammenarbeit mit der lokalen Bevölkerung auf sozialer und entwicklungspolitischer Ebene ein zentrales Element unserer Tätigkeit dar. Somit wird sowohl eine auf die NutzerInnen abgestimmte Lösung als auch die Wertschöpfung für die Menschen vor Ort gewährleistet. Neben der Ausarbeitung und Umsetzung von technisch einfachen aber robusten Lösungen für die primären Notwendigkeiten, wie die Versorgung mit Trinkwasser und Elektrizität sowie die Errichtung von Sanitäranlagen, die einem jedem Menschen, egal welcher ethnischer Zugehörigkeit, ob reich oder arm, zur Verfügung stehen sollte, versuchen wir auch technisches Wissen an die Menschen in den Entwicklungsländern weiterzuvermitteln.',
website: 'http://www.iog-austria.at', created: 1500000000, modified: 1504504377});
match (org:Organization {organizationId: '9'}), (np:NetworkingPlatform {platformId: '3'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '10', name: 'murXkraftwerk', slogan: '',
description: 'Parteiunabhängie Informations- und Kommunikationsplattform um rund um die Themen Murkraftwerk Graz, zentraler Speicherkanal und Stadt- und Gesellschaftsentwicklung in Graz, die alle Menschen der Stadt Graz, denen eine lebenswerte Zukunft für alle wichtiger ist als der Gewinn einiger weniger ist, zum aktiven mit machen animieren will, denn wirst Du selbst nicht aktiv, geht es schief!

Es geht um viel mehr als nur ein Kraftwerk, das ein wichtiges Stück Natur mitten in Graz zerstört, sondern auch darum, dass wir künstlich durch Politik und Wirtschaft geschaffene Zwänge zu immer mehr Energie- und Ressourcenverbrauch - auch auf Kosten unseres eigenen Lebens! - abwehren wollen und für eine Demokratisierung von Politik und Wirtschaft uns einsetzen.',
website: 'http://www.murxkraftwerk.at', created: 1504800000, modified: 1504504377});
match (org:Organization {organizationId: '10'}), (np:NetworkingPlatform {platformId: '3'})
merge (np)-[:CREATED]->(org);

match (admin:Admin {adminId: '2'})
merge (admin)-[:IS_ADMIN]->(org:Organization {organizationId: '11', name: 'Rettet die Mur', slogan: '',
description: 'Seit Jahrhunderten hat unsere Mur einen besonderen Wert für die Bevölkerung in und um Graz. Sie dient uns BürgerInnen als natürliches Naherholungsgebiet mitten in der Stadt. Auch viele Tier- und Pflanzenarten finden hier einen optimalen Lebensraum vor. Die Energie Steiermark plant jedoch den Bau einer Staustufe direkt Herzen von Graz. Der Stau würde bis zur Murinsel reichen. Die Lebensqualität würde dadurch stark beeinträchtigt. "Rettet die Mur" setzt sich für den Erhalt dieses einzigartigen Natur- und Lebensraumes ein.',
website: 'http://www.rettetdiemur.at', created: 1500009000, modified: 1504504377});
match (org:Organization {organizationId: '11'}), (np:NetworkingPlatform {platformId: '3'})
merge (np)-[:CREATED]->(org);

//Assign for Gemeinsam Jetzt categories to organizations

match (org:Organization), (np:NetworkingPlatform {platformId: '3'})
  where org.organizationId IN ['5', '6', '7']
merge (org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)
with assigner
match (category:Category)
  where category.categoryId IN ['15']
merge (assigner)-[:ASSIGNED]->(category);

match (org:Organization), (np:NetworkingPlatform {platformId: '3'})
  where org.organizationId IN ['8', '9', '10', '11']
merge (org)-[:ASSIGNED]->(assigner:CategoryAssigner)-[:ASSIGNED]->(np)
with assigner
match (category:Category)
  where category.categoryId IN ['16']
merge (assigner)-[:ASSIGNED]->(category);

//Epxort organizations
match (org:Organization {organizationId: '1'}), (np:NetworkingPlatform {platformId: '2'})
merge (org)-[:EXPORT {exportTimestamp: 1504593500}]->(np);