"""
DNS SECURITY SCANNER - CORE SCANNING LOGIC
COPY THIS ENTIRE CODE TO: backend/scanner/dns_scanner.py
"""
import dns.resolver
import dns.exception
import whois
from datetime import datetime
import re

class DNSSecurityScanner:
    def __init__(self, domain):
        self.domain = domain
        self.results = {
            'domain': domain,
            'records': {},
            'security_score': 0,
            'grade': 'F',
            'findings': [],
            'email_security': {},
            'infrastructure': {}
        }
    
    def scan_all(self):
        """Main scanning function"""
        self.fetch_all_records()
        self.check_email_security()
        self.check_infrastructure_security()
        self.calculate_score()
        self.assign_grade()
        return self.results
    
    def fetch_all_records(self):
        """Fetch DNS records"""
        record_types = ['A', 'MX', 'TXT', 'CNAME', 'NS']
        for record_type in record_types:
            try:
                answers = dns.resolver.resolve(self.domain, record_type)
                self.results['records'][record_type] = [str(answer) for answer in answers]
            except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.exception.Timeout):
                self.results['records'][record_type] = []
            except Exception as e:
                self.results['records'][record_type] = []
    
    def check_email_security(self):
        """Check SPF and DMARC configuration"""
        email_security = {
            'spf': {'status': 'fail', 'details': None, 'risk': 'critical'},
            'dmarc': {'status': 'fail', 'details': None, 'risk': 'critical'},
            'dkim': {'status': 'fail', 'details': None, 'risk': 'warning'}
        }
        
        # Check SPF
        spf_records = self.results['records'].get('TXT', [])
        spf_found = None
        for record in spf_records:
            if 'v=spf1' in record:
                spf_found = record
                break
        
        if spf_found:
            if '+all' in spf_found:
                email_security['spf'] = {
                    'status': 'fail',
                    'details': 'SPF has +all (anyone can send)',
                    'risk': 'critical'
                }
            else:
                email_security['spf'] = {
                    'status': 'pass',
                    'details': 'SPF properly configured',
                    'risk': 'pass'
                }
        else:
            email_security['spf'] = {
                'status': 'fail',
                'details': 'No SPF record found',
                'risk': 'critical'
            }
        
        # Check DMARC
        try:
            dmarc_domain = f"_dmarc.{self.domain}"
            dmarc_records = dns.resolver.resolve(dmarc_domain, 'TXT')
            dmarc_found = None
            for record in dmarc_records:
                if 'v=DMARC1' in str(record):
                    dmarc_found = str(record)
                    break
            
            if dmarc_found:
                if 'p=reject' in dmarc_found:
                    email_security['dmarc'] = {
                        'status': 'pass',
                        'details': 'DMARC policy: reject (best)',
                        'risk': 'pass'
                    }
                elif 'p=quarantine' in dmarc_found:
                    email_security['dmarc'] = {
                        'status': 'warning',
                        'details': 'DMARC policy: quarantine',
                        'risk': 'warning'
                    }
                else:
                    email_security['dmarc'] = {
                        'status': 'warning',
                        'details': f'DMARC policy: {dmarc_found[:50]}',
                        'risk': 'warning'
                    }
            else:
                email_security['dmarc'] = {
                    'status': 'fail',
                    'details': 'No DMARC record found',
                    'risk': 'critical'
                }
        except:
            email_security['dmarc'] = {
                'status': 'fail',
                'details': 'DMARC query failed',
                'risk': 'critical'
            }
        
        self.results['email_security'] = email_security
    
    def check_infrastructure_security(self):
        """Check DNSSEC, TTL, and domain expiry"""
        infrastructure = {
            'dnssec': {'status': 'fail', 'details': None, 'risk': 'critical'},
            'ttl_analysis': {'status': 'warning', 'details': None, 'risk': 'warning'},
            'bimi': {'status': 'fail', 'details': None, 'risk': 'info'}
        }
        
        # Check DNSSEC
        try:
            dns.resolver.resolve(self.domain, 'DNSKEY')
            infrastructure['dnssec'] = {
                'status': 'pass',
                'details': 'DNSSEC is enabled',
                'risk': 'pass'
            }
        except:
            infrastructure['dnssec'] = {
                'status': 'fail',
                'details': 'DNSSEC not enabled',
                'risk': 'critical'
            }
        
        # Check TTL values
        high_ttl_found = False
        for record_type, records in self.results['records'].items():
            if records:
                try:
                    answers = dns.resolver.resolve(self.domain, record_type)
                    for answer in answers:
                        if hasattr(answer, 'ttl') and answer.ttl > 3600:
                            high_ttl_found = True
                except:
                    pass
        
        if high_ttl_found:
            infrastructure['ttl_analysis'] = {
                'status': 'warning',
                'details': 'High TTL values (>3600s) found - slow propagation',
                'risk': 'warning'
            }
        else:
            infrastructure['ttl_analysis'] = {
                'status': 'pass',
                'details': 'TTL values are optimal',
                'risk': 'pass'
            }
        
        # Check domain expiry
        try:
            domain_info = whois.whois(self.domain)
            if domain_info.expiration_date:
                if isinstance(domain_info.expiration_date, list):
                    expiry_date = domain_info.expiration_date[0]
                else:
                    expiry_date = domain_info.expiration_date
                
                days_until_expiry = (expiry_date - datetime.now()).days
                if days_until_expiry < 30:
                    infrastructure['domain_expiry'] = {
                        'status': 'critical',
                        'details': f'Domain expires in {days_until_expiry} days',
                        'risk': 'critical'
                    }
                else:
                    infrastructure['domain_expiry'] = {
                        'status': 'pass',
                        'details': f'Domain expires in {days_until_expiry} days',
                        'risk': 'pass'
                    }
        except:
            infrastructure['domain_expiry'] = {
                'status': 'warning',
                'details': 'Could not check domain expiry',
                'risk': 'warning'
            }
        
        self.results['infrastructure'] = infrastructure
    
    def calculate_score(self):
        """Calculate security score (0-100)"""
        score = 0
        
        # SPF check
        if self.results['email_security']['spf']['status'] == 'pass':
            score += 20
        
        # DMARC check
        if self.results['email_security']['dmarc']['status'] == 'pass':
            score += 20
        elif self.results['email_security']['dmarc']['status'] == 'warning':
            score += 10
        
        # DNSSEC check
        if self.results['infrastructure']['dnssec']['status'] == 'pass':
            score += 30
        
        # Domain expiry penalty
        if 'domain_expiry' in self.results['infrastructure']:
            if self.results['infrastructure']['domain_expiry']['status'] == 'critical':
                score -= 20
        
        # Ensure score is between 0-100
        self.results['security_score'] = max(0, min(100, score))
    
    def assign_grade(self):
        """Assign letter grade based on score"""
        score = self.results['security_score']
        if score >= 90:
            grade = 'A+'
        elif score >= 80:
            grade = 'A'
        elif score >= 70:
            grade = 'B'
        elif score >= 60:
            grade = 'C'
        elif score >= 50:
            grade = 'D'
        else:
            grade = 'F'
        
        self.results['grade'] = grade